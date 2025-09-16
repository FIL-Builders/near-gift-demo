import { flag } from "@vercel/flags/next"
import { headers } from "next/headers"

import { domains } from "@src/config/domains"
import { logger } from "@src/utils/logger"

export type WhitelabelTemplateValue =
  | "near-intents"
  | "solswap"
  | "dogecoinswap"
  | "turboswap"
  | "trumpswap"

export const whitelabelTemplateFlag = flag<WhitelabelTemplateValue>({
  key: "whitelabelTemplate",
  defaultValue: "near-intents" as WhitelabelTemplateValue,
  options: [
    { label: "near-intents.org", value: "near-intents" },
    { label: "SolSwap.org", value: "solswap" },
    { label: "DogecoinSwap.org", value: "dogecoinswap" },
    { label: "TurboSwap.org", value: "turboswap" },
    { label: "trump-swap.org", value: "trumpswap" },
  ],
  async decide(): Promise<WhitelabelTemplateValue> {
    const headers_ = await headers()
    const host = headers_.get("host")
    if (host != null) {
      if (domains[host]) {
        return domains[host]
      }
    }

    return "near-intents"
  },
})

export const maintenanceModeFlag = flag({
  key: "maintenanceMode",
  defaultValue: false as boolean,
  options: [
    { label: "On", value: true },
    { label: "Off", value: false },
  ],
  async decide() {
    // Only attempt Edge Config when a connection string is present at build time
    // This avoids Netlify edge runtime errors when EDGE_CONFIG is not configured
    const hasEdgeConfig = Boolean(process.env.EDGE_CONFIG)
    if (!hasEdgeConfig) return false

    try {
      const { get } = await import("@vercel/edge-config")
      const isMaintenanceMode = await get("isMaintenanceMode")
      return isMaintenanceMode === true
    } catch (err) {
      logger.error(err)
      return false
    }
  },
})
