import { NextResponse } from "next/server"

import { SupabaseConfigError, getSupabase } from "@src/libs/supabaseServer"

export async function GET() {
  try {
    const supabase = getSupabase()

    // Probe the expected table; use HEAD + count for a lightweight check
    const { error, count } = await supabase
      .from("gifts")
      .select("gift_id", { count: "exact", head: true })

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: "Supabase reachable but 'gifts' table query failed",
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: "Ensure the 'gifts' table exists and your service role has access.",
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase configured",
      details: { table: "gifts", count: count ?? 0 },
    })
  } catch (err) {
    if (err instanceof SupabaseConfigError) {
      return NextResponse.json(
        {
          ok: false,
          message: err.message,
          code: err.code,
          hint: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your server environment.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Unexpected error probing Supabase",
      },
      { status: 500 }
    )
  }
}
