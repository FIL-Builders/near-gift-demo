import type { Intent, MultiPayload } from "@defuse-protocol/contract-types"
import { logger } from "../../../logger"

type TransferIntentSubset = {
  intent: "transfer"
  receiver_id: string
  tokens: {
    [k: string]: string
  }
}

export function parseMultiPayloadTransferMessage(
  multiPayload: MultiPayload
): null | TransferIntentSubset {
  try {
    const anyPayload = multiPayload as unknown as {
      standard?: string
      payload?: unknown
    }
    const standard = anyPayload.standard
    if (!standard) return null

    // Normalize payload: some signers return JSON-encoded string
    const normalizedPayload: unknown =
      typeof anyPayload.payload === "string"
        ? safeJsonParse(anyPayload.payload)
        : anyPayload.payload

    // Try standard-specific known shapes first
    let intents: Intent[] | undefined
    if (standard === "nep413") {
      if (normalizedPayload && typeof normalizedPayload === "object") {
        const messageField = (normalizedPayload as Record<string, unknown>)
          .message
        // NEP-413 often encodes `message` as a JSON string; parse if needed
        const msgObj =
          typeof messageField === "string"
            ? (safeJsonParse(messageField) as unknown)
            : messageField
        if (msgObj && typeof msgObj === "object") {
          const msg = msgObj as Record<string, unknown>
          if (Array.isArray(msg.intents)) intents = msg.intents as Intent[]
        }
      }
    } else if (
      standard === "erc191" ||
      standard === "raw_ed25519" ||
      standard === "webauthn"
    ) {
      if (
        normalizedPayload &&
        typeof normalizedPayload === "object" &&
        Array.isArray((normalizedPayload as Record<string, unknown>).intents)
      ) {
        intents = (normalizedPayload as Record<string, unknown>)
          .intents as Intent[]
      }
    }

    // Fallback: try alternate nesting patterns found in older/newer payloads
    if (!intents) {
      intents = findIntents(normalizedPayload)
    }

    const firstIntent = intents?.[0]
    return firstIntent && isTransferIntent(firstIntent) ? firstIntent : null
  } catch (e) {
    logger.error(e)
    return null
  }
}

function findIntents(payload: unknown): Intent[] | undefined {
  if (!payload || typeof payload !== "object") return undefined
  const obj = payload as Record<string, unknown>
  // Direct
  const direct = obj.intents
  if (Array.isArray(direct)) return direct as Intent[]
  // Under message
  const messageRaw = obj.message
  const message =
    typeof messageRaw === "string" ? safeJsonParse(messageRaw) : messageRaw
  if (message && typeof message === "object") {
    const intents = (message as Record<string, unknown>).intents
    if (Array.isArray(intents)) return intents as Intent[]
  }
  // Under nested payload/message combinations
  const nestedPayload = obj.payload
  if (nestedPayload && typeof nestedPayload === "object") {
    const np = nestedPayload as Record<string, unknown>
    const intents = np.intents
    if (Array.isArray(intents)) return intents as Intent[]
    const msg2 = np.message
    if (msg2 && typeof msg2 === "object") {
      const intents2 = (msg2 as Record<string, unknown>).intents
      if (Array.isArray(intents2)) return intents2 as Intent[]
    }
  }
  // Shallow search in first-level object values
  for (const value of Object.values(obj)) {
    const found = findIntents(value)
    if (found) return found
  }
  return undefined
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function isTransferIntent(intent: Intent): intent is TransferIntentSubset {
  return (
    intent.intent === "transfer" &&
    "receiver_id" in intent &&
    "tokens" in intent
  )
}

export function getTokenDiffFromTransferMessage(
  message: TransferIntentSubset
): null | Record<string, bigint> {
  if (message.intent !== "transfer") {
    return null
  }

  return Object.fromEntries(
    Object.entries(message.tokens).map(([token, amount]) => [
      token,
      BigInt(amount),
    ])
  )
}
