"use client"
import type { ReactNode } from "react"

import type { WhitelabelTemplateValue } from "@src/config/featureFlags"
import { FeatureFlagsProvider } from "@src/providers/FeatureFlagsProvider"

export function PreloadFeatureFlags({ children }: { children: ReactNode }) {
  // Learning edition: avoid server/edge flags evaluation; use static defaults
  const flags: FeatureFlagValues = { whitelabelTemplate: "near-intents" }
  return <FeatureFlagsProvider flags={flags}>{children}</FeatureFlagsProvider>
}

export interface FeatureFlagValues {
  whitelabelTemplate: WhitelabelTemplateValue
}
