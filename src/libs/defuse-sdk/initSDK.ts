import {
  configureSDK,
  config as currentSDKConfig,
} from "@src/components/DefuseSDK/config"
import {
  APP_ENV,
  BASE_URL,
  INTENTS_ENV,
  SOLVER_RELAY_BASE_URL,
} from "@src/utils/environment"

let hasInitialized = false

export function initSDK() {
  if (hasInitialized) {
    return
  }
  hasInitialized = true

  // Normalize optional override; accept absolute or relative (e.g. "/api/relay/")
  const normalizeOverride = (value: string | undefined): string | undefined => {
    if (!value) return undefined
    let v = value
    if (!v.endsWith("/")) v = `${v}/`
    if (v.startsWith("http://") || v.startsWith("https://")) return v
    const makeAbsolute = (rel: string) => {
      try {
        if (typeof window !== "undefined") {
          return new URL(rel, window.location.origin).toString()
        }
      } catch {}
      const base =
        BASE_URL && BASE_URL.length > 0 ? BASE_URL : "http://localhost:3000"
      const baseNoSlash = base.endsWith("/") ? base.slice(0, -1) : base
      return `${baseNoSlash}${rel.startsWith("/") ? rel : `/${rel}`}`
    }
    return makeAbsolute(v.startsWith("/") ? v : `/${v}`)
  }

  const overrideBase = normalizeOverride(SOLVER_RELAY_BASE_URL)

  const envArg = overrideBase
    ? { ...currentSDKConfig.env, solverRelayBaseURL: overrideBase }
    : INTENTS_ENV

  configureSDK({
    env: envArg,
    logger: {
      verbose: console.log,
      debug: console.info,
      info: console.info,
      warn: console.warn,
      error: console.error,
    },
    features: {
      hyperliquid: true,
      ton: true,
      near_intents: true,
      avalanche: true,
      sui: true,
      stellar: true,
      optimism: true,
      aptos: true,
    },
  })
}
