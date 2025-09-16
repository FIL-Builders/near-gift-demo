import type {
  BaseTokenInfo,
  UnifiedTokenInfo,
} from "@src/components/DefuseSDK/types"
import { INTENTS_ENV } from "@src/utils/environment"

export type TokenWithTags =
  | (BaseTokenInfo & { tags?: string[] })
  | (UnifiedTokenInfo & { tags?: string[] })

// Learning edition: keep only ZEC and NEAR
const ZEC: TokenWithTags = {
  unifiedAssetId: "zcash",
  symbol: "ZEC",
  name: "Zcash",
  icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/1437.png",
  groupedTokens: [
    {
      defuseAssetId: "nep141:zec.omft.near",
      type: "native",
      decimals: 8,
      icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/1437.png",
      chainName: "zcash",
      bridge: "poa",
      symbol: "ZEC",
      name: "Zcash",
    },
    {
      defuseAssetId: "nep141:zec.omft.near",
      address: "zec.omft.near",
      decimals: 8,
      icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/1437.png",
      chainName: "near",
      bridge: "direct",
      symbol: "ZEC",
      name: "Zcash",
    },
  ],
  tags: ["mc:120"],
}

const NEAR: TokenWithTags = {
  unifiedAssetId: "near",
  symbol: "NEAR",
  name: "Near",
  icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/6535.png",
  groupedTokens: [
    {
      defuseAssetId: "nep141:wrap.near",
      address: "wrap.near",
      decimals: 24,
      icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/6535.png",
      chainName: "near",
      bridge: "direct",
      symbol: "NEAR",
      name: "Near",
    },
  ],
  tags: ["mc:31"],
}

export const PRODUCTION_TOKENS: TokenWithTags[] = [ZEC, NEAR]

const STAGE_TOKENS: TokenWithTags[] = [ZEC, NEAR]

export const LIST_TOKENS: TokenWithTags[] =
  INTENTS_ENV === "production" ? PRODUCTION_TOKENS : STAGE_TOKENS

export const DEPRECATED_TOKENS: Record<string, boolean> = {
  "nep141:aurora": true,
}

