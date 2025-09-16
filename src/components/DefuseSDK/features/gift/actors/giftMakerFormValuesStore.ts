import { createStore } from "@xstate/store"
import type { BaseTokenInfo, UnifiedTokenInfo } from "../../../types/base"

export type GiftMakerFormValuesState = {
  amount: string
  token: null | BaseTokenInfo | UnifiedTokenInfo
  message: string
  imageCid: string | null
}

export const createGiftMakerFormValuesStore = ({
  initialToken,
}: {
  initialToken: BaseTokenInfo | UnifiedTokenInfo
}) =>
  createStore({
    context: {
      amount: "",
      token: initialToken,
      message: "",
      imageCid: null,
    } satisfies GiftMakerFormValuesState,
    emits: {
      changed: (_: { context: GiftMakerFormValuesState }) => {},
    },
    on: {
      updateAmount: (context, event: { value: string }, enqueue) => {
        const newContext = {
          ...context,
          amount: event.value,
        }
        enqueue.emit.changed({ context: newContext })
        return newContext
      },
      updateToken: (
        context,
        event: { value: BaseTokenInfo | UnifiedTokenInfo },
        enqueue
      ) => {
        const newContext = {
          ...context,
          token: event.value,
        }
        enqueue.emit.changed({ context: newContext })
        return newContext
      },
      updateMessage: (context, event: { value: string }, enqueue) => {
        const newContext = {
          ...context,
          message: event.value,
        }
        enqueue.emit.changed({ context: newContext })
        return newContext
      },
      updateImageCid: (context, event: { value: string | null }, enqueue) => {
        const newContext = {
          ...context,
          imageCid: event.value,
        }
        enqueue.emit.changed({ context: newContext })
        return newContext
      },
    },
  })
