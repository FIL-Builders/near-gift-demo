import {
  INTENTS_ENV,
  SOLVER_RELAY_UPSTREAM_BASE_URL,
} from "@src/utils/environment"
import { logger } from "@src/utils/logger"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const ensureSlash = (s: string) => (s.endsWith("/") ? s : `${s}/`)
    const defaultUpstream =
      INTENTS_ENV === "stage"
        ? "https://solver-relay-stage.intents-near.org/"
        : "https://solver-relay-v2.chaindefuser.com/"
    const targetBase = ensureSlash(
      SOLVER_RELAY_UPSTREAM_BASE_URL || defaultUpstream
    )
    const incomingUrl = new URL(request.url)
    const target = new URL("rpc", targetBase)
    // Preserve query params like method=publish_intents
    for (const [k, v] of incomingUrl.searchParams) target.searchParams.set(k, v)

    const body = await request.json().catch(() => ({}))
    const t0 = performance.now()
    logger.info("Proxy POST /api/relay/rpc -> solver relay", {
      relay: {
        target: target.toString(),
        upstreamBase: targetBase,
        method: incomingUrl.searchParams.get("method"),
      },
    })

    const resp = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const text = await resp.text()

    logger.info("Proxy /api/relay/rpc response", {
      relay: { status: resp.status, ms: Math.round(performance.now() - t0) },
    })

    return new NextResponse(text, {
      status: resp.status,
      headers: {
        "Content-Type": resp.headers.get("Content-Type") || "application/json",
      },
    })
  } catch (err) {
    logger.error(err)
    return NextResponse.json({ error: "Proxy error" }, { status: 500 })
  }
}
