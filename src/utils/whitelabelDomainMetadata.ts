import type { WhitelabelTemplateValue } from "@src/config/domains"

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? ""

export const getDomainMetadataParams = (
  whitelabelTemplate: WhitelabelTemplateValue
) => {
  const params = {
    projectId: PROJECT_ID,
    metadata: {
      name: "NEAR Intents",
      description: "NEAR Intents",
      url: "https://near-intents.org/",
      icons: [
        "https://near-intents.org/favicons/near-intents/favicon-32x32.png",
      ],
    },
  }

  return params
}
