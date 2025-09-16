import type { GetGiftResponse } from "@src/features/gift/types/giftTypes"
import { SupabaseConfigError, getSupabase } from "@src/libs/supabaseServer"
import { APP_ENV } from "@src/utils/environment"
import { logger } from "@src/utils/logger"
import { NextResponse } from "next/server"
import { z } from "zod"

const giftIdSchema = z
  .string()
  .uuid()
  .refine((val) => {
    // UUID v5 has version bits set to 5 (0101)
    return val[14] === "5"
  }, "Invalid gift_id format") as z.ZodType<string>

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ giftId: string }> }
) {
  try {
    const supabase = getSupabase()
    const { giftId } = await params
    const validatedData = giftIdSchema.parse(giftId)
    logger.info("API GET /api/gifts/[giftId]: fetching from Supabase", {
      api: { route: "/api/gifts/[giftId]" },
      gift: { gift_id: validatedData },
    })

    const { data, error } = await supabase
      .from("gifts")
      .select("encrypted_payload, p_key, image_cid")
      .eq("gift_id", validatedData)
      .maybeSingle()

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
          : { error: "Failed to fetch gift" }
      return NextResponse.json(payload, { status: 500 })
    }

    if (!data) {
      return NextResponse.json(
        { error: "Otc trade not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      encrypted_payload: data.encrypted_payload,
      p_key: data.p_key,
      image_cid: data.image_cid ?? null,
    } satisfies GetGiftResponse)
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    logger.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
