import { base64 } from "@scure/base"
import { base64urlnopad } from "@scure/base"
import type {
  CreateGiftRequest,
  CreateGiftResponse,
  ErrorResponse,
} from "@src/features/gift/types/giftTypes"
import { SupabaseConfigError, getSupabase } from "@src/libs/supabaseServer"
import { APP_ENV } from "@src/utils/environment"
import { logger } from "@src/utils/logger"
import { NextResponse } from "next/server"
import { z } from "zod"

const giftsSchema = z.object({
  gift_id: z
    .string()
    .uuid()
    .refine((val) => {
      // UUID v5 has version bits set to 5 (0101)
      return val[14] === "5"
    }, "Invalid gift_id format"),
  encrypted_payload: z.string().refine((val) => {
    try {
      const decoded = base64.decode(val)
      // AES-GCM produces variable length output, but should be at least 16 bytes
      return decoded.length >= 16
    } catch (_err) {
      return false
    }
  }, "Invalid encrypted_payload format"),
  p_key: z.string().refine((val) => {
    try {
      const keyBytes = base64urlnopad.decode(val)
      return keyBytes.length === 32
    } catch {
      return false
    }
  }, "Key must be exactly 32 bytes (AES-256)"),
  image_cid: z.string().min(1).optional().nullable(),
}) as z.ZodType<CreateGiftRequest>

export async function POST(request: Request) {
  try {
    const debugId = request.headers.get("x-debug-request-id")
    logger.info("API POST /api/gifts: request received", {
      api: { route: "/api/gifts", debugId },
    })
    const supabase = getSupabase()
    const body = await request.json()
    const validatedData = giftsSchema.parse(body)
    logger.info("API POST /api/gifts: inserting into Supabase", {
      api: { route: "/api/gifts", debugId },
      gift: {
        gift_id: validatedData.gift_id,
        payloadBytes: validatedData.encrypted_payload.length,
      },
    })
    const { error } = await supabase.from("gifts").insert(validatedData)

    if (error) {
      logger.error(error)
      const payload =
        APP_ENV === "development"
          ? {
              error: {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: "Check Supabase URL/key and DB 'gifts' table exists.",
              },
            }
          : ({ error: "Failed to create gift" } satisfies ErrorResponse)
      return NextResponse.json(payload, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
      } satisfies CreateGiftResponse,
      {
        status: 201,
      }
    )
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      return NextResponse.json(
        { error: error.message } satisfies ErrorResponse,
        { status: 500 }
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors } satisfies ErrorResponse,
        { status: 400 }
      )
    }

    logger.error(error)
    return NextResponse.json(
      { error: "Internal server error" } satisfies ErrorResponse,
      { status: 500 }
    )
  }
}
