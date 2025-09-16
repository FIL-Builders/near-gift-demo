import { APP_ENV, BASE_URL } from "@src/utils/environment"
import { logger } from "@src/utils/logger"
import type {
  CreateGiftRequest,
  CreateGiftResponse,
  ErrorResponse,
  GetGiftResponse,
} from "../types/giftTypes"

function makeEndpoint(path: string): string {
  if (!BASE_URL) return path
  const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL
  return `${base}${path}`
}

export async function createGift(request: CreateGiftRequest) {
  const endpoint = makeEndpoint("/api/gifts")
  const t0 = performance.now()
  logger.info("giftAPI.createGift: sending request", {
    api: { endpoint, hasBaseUrl: Boolean(BASE_URL) },
    gift: {
      gift_id: request.gift_id,
      payloadBytes: request.encrypted_payload.length,
    },
  })
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-debug-request-id": request.gift_id,
    },
    body: JSON.stringify(request),
  })
  logger.info("giftAPI.createGift: response received", {
    api: {
      endpoint,
      status: response.status,
      ms: Math.round(performance.now() - t0),
    },
  })
  if (!response.ok) {
    await handleApiError(response, "Failed to request Gift")
  }

  return response.json() as Promise<CreateGiftResponse>
}

export async function getGift(tradeId: string) {
  const endpoint = makeEndpoint(`/api/gifts/${tradeId}`)
  const t0 = performance.now()
  logger.info("giftAPI.getGift: sending request", {
    api: { endpoint, hasBaseUrl: Boolean(BASE_URL) },
    gift: { gift_id: tradeId },
  })
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-debug-request-id": tradeId,
    },
  })
  logger.info("giftAPI.getGift: response received", {
    api: {
      endpoint,
      status: response.status,
      ms: Math.round(performance.now() - t0),
    },
  })
  if (!response.ok) {
    await handleApiError(response, "Failed to verify Gift")
  }

  return response.json() as Promise<GetGiftResponse>
}

async function handleApiError(response: Response, fallbackMessage: string) {
  try {
    const error = (await response.json()) as ErrorResponse
    if (typeof error.error === "string") {
      throw new Error(error.error)
    }
    // When error is an object, include details in development to aid debugging
    if (APP_ENV === "development") {
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(error.error)}`
      )
    }
    throw new Error(fallbackMessage)
  } catch {
    // Non-JSON or empty response body; fall back to generic message
    throw new Error(fallbackMessage)
  }
}
