import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Feature flags have been removed; return empty set
  return NextResponse.json({})
}
