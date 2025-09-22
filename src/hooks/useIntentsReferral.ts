import type { WhitelabelTemplateValue } from "@src/config/domains"
import { FeatureFlagsContext } from "@src/providers/FeatureFlagsProvider"
import { useContext } from "react"

export const referralMap: Record<WhitelabelTemplateValue, string> = {
  "near-intents": "near-intents.intents-referral.near",
}

export function useIntentsReferral() {
  const { whitelabelTemplate } = useContext(FeatureFlagsContext)
  return referralMap[whitelabelTemplate]
}
