import type { MultiPayload } from "@defuse-protocol/contract-types"
import type { walletMessage } from "@defuse-protocol/internal-utils"
import type { SignerCredentials } from "../../../core/formatters"
import type { StorageOperationErr } from "../stores/storageOperations"

export type SignMessage = (
  params: walletMessage.WalletMessage
) => Promise<walletMessage.WalletSignatureResult | null>

export type GiftLinkData = {
  secretKey: string
  message: string
  imageCid?: string | null
}

export type GiftSignedResult = {
  multiPayload: MultiPayload
  signerCredentials: SignerCredentials
  signatureResult: walletMessage.WalletSignatureResult
  // Learning edition: include explicit token diff to avoid parsing ambiguity
  tokenDiff?: Record<string, bigint>
}

export type CreateGiftIntent = (
  payload: GiftLinkData
) => Promise<{ iv: string; giftId: string }>

export type GenerateLink = (params: {
  secretKey: string
  message: string
  // Fallback to empty string for backwards compatibility with gifts created before IV was added
  iv: null | string
}) => string

export type SavingGiftResult =
  | { tag: "ok"; value: { iv: string } }
  | { tag: "err"; reason: StorageOperationErr }
