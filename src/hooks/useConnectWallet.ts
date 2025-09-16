"use client"

import type { FinalExecutionOutcome } from "@near-wallet-selector/core"
import { BaseError } from "@src/components/DefuseSDK/errors/base"
import {
  useWebAuthnActions,
  useWebAuthnCurrentCredential,
  useWebAuthnUIStore,
} from "@src/features/webauthn/hooks/useWebAuthnStore"
import { useSignInLogger } from "@src/hooks/useSignInLogger"
import { useNearWallet } from "@src/providers/NearWalletProvider"
import { useVerifiedWalletsStore } from "@src/stores/useVerifiedWalletsStore"
import type { SignAndSendTransactionsParams } from "@src/types/interfaces"
import { useSearchParams } from "next/navigation"
import { useCallback } from "react"

import {
  useAccount as useEvmAccount,
  useConnect as useEvmConnect,
  useConnections as useEvmConnections,
  useDisconnect as useEvmDisconnect,
} from "wagmi"
export enum ChainType {
  Near = "near",
  WebAuthn = "webauthn",
  // Retained for compatibility but unsupported in learning edition
  EVM = "evm",
  Solana = "solana",
  Ton = "ton",
  Stellar = "stellar",
  Tron = "tron",
}

export type State = {
  chainType?: ChainType
  network?: string
  address?: string
  displayAddress?: string
  isVerified: boolean
  isFake: boolean // in most cases, this is used for testing purposes only
}

interface ConnectWalletAction {
  signIn: (params: {
    id: ChainType
    connectorKey?: "injected" | "walletConnect" | "coinbaseWallet"
  }) => Promise<void>
  signOut: (params: { id: ChainType }) => Promise<void>
  sendTransaction: (params: {
    id: ChainType
    tx?: SignAndSendTransactionsParams["transactions"]
  }) => Promise<string | FinalExecutionOutcome[]>
  state: State
}

const defaultState: State = {
  chainType: undefined,
  network: undefined,
  address: undefined,
  displayAddress: undefined,
  isVerified: false,
  isFake: false,
}

export const useConnectWallet = (): ConnectWalletAction => {
  let state: State = defaultState

  // NEAR
  const nearWallet = useNearWallet()
  // EVM (top-level hooks to satisfy Rules of Hooks)
  const evmAccount = useEvmAccount()
  const evmConnect = useEvmConnect()
  const evmDisconnect = useEvmDisconnect()
  const evmConnections = useEvmConnections()
  if (nearWallet.accountId != null) {
    state = {
      address: nearWallet.accountId,
      displayAddress: nearWallet.accountId,
      network: "near:mainnet",
      chainType: ChainType.Near,
      isVerified: false,
      isFake: false,
    }
  }

  // WebAuthn
  const currentPasskey = useWebAuthnCurrentCredential()
  const webAuthnActions = useWebAuthnActions()
  const webAuthnUI = useWebAuthnUIStore()

  if (currentPasskey != null) {
    state = {
      address: currentPasskey.publicKey,
      displayAddress: currentPasskey.publicKey,
      chainType: ChainType.WebAuthn,
      isVerified: false,
      isFake: false,
    }
  }

  // EVM account (if connected)
  if (evmAccount.address) {
    const network = (() => {
      switch (evmAccount.chainId) {
        case 1:
          return "eth:mainnet"
        case 5:
          return "eth:goerli"
        case 11155111:
          return "eth:sepolia"
        default:
          return `evm:chain-${evmAccount.chainId ?? "unknown"}`
      }
    })()
    state = {
      address: evmAccount.address,
      displayAddress: evmAccount.address,
      network,
      chainType: ChainType.EVM,
      isVerified: false,
      isFake: false,
    }
  }

  // Verification
  state.isVerified = useVerifiedWalletsStore(
    useCallback(
      (store) =>
        state.address != null
          ? store.walletAddresses.includes(state.address)
          : false,
      [state.address]
    )
  )

  const impersonatedUser = useImpersonatedUser()
  if (impersonatedUser) {
    state = impersonatedUser
  }

  const { onSignOut } = useSignInLogger(
    state.address,
    state.chainType,
    state.isVerified
  )

  return {
    async signIn(params: {
      id: ChainType
      connectorKey?: "injected" | "walletConnect" | "coinbaseWallet"
    }): Promise<void> {
      const strategies: Partial<Record<ChainType, () => void | Promise<void>>> =
        {
          [ChainType.Near]: () => nearWallet.connect(),
          [ChainType.WebAuthn]: () => webAuthnUI.open(),
          [ChainType.EVM]: async () => {
            const preferred = params.connectorKey
            const connector =
              (preferred &&
                evmConnect.connectors.find((c) => c.id === preferred)) ||
              evmConnect.connectors.find((c) => c.id === "injected") ||
              evmConnect.connectors[0]
            if (!connector) throw new Error("No EVM connector available")
            await evmConnect.connectAsync({ connector })
          },
        }
      const fn = strategies[params.id]
      if (!fn) throw new Error(`Unsupported sign in type: ${params.id}`)
      return fn()
    },

    async signOut(params: { id: ChainType }): Promise<void> {
      try {
        const strategies: Partial<
          Record<ChainType, () => void | Promise<void>>
        > = {
          [ChainType.Near]: () => nearWallet.disconnect(),
          [ChainType.WebAuthn]: () => webAuthnActions.signOut(),
          [ChainType.EVM]: async () => {
            const tasks = evmConnections.map(({ connector }) =>
              evmDisconnect.disconnectAsync
                ? evmDisconnect.disconnectAsync({ connector })
                : Promise.resolve(evmDisconnect.disconnect({ connector }))
            )
            await Promise.all(tasks)
          },
        }
        onSignOut()
        const fn = strategies[params.id]
        if (!fn)
          throw new WalletDisconnectError(
            params.id,
            "Unsupported sign out type"
          )
        return fn()
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        const originalError = error instanceof Error ? error : undefined
        throw new WalletDisconnectError(params.id, errorMessage, originalError)
      }
    },

    sendTransaction: async (
      params
    ): Promise<string | FinalExecutionOutcome[]> => {
      const strategies: Partial<
        Record<ChainType, () => Promise<string | FinalExecutionOutcome[]>>
      > = {
        [ChainType.Near]: async () => {
          if (!nearWallet.accountId) {
            throw new Error("NEAR wallet not connected")
          }
          return await nearWallet.signAndSendTransactions({
            transactions:
              params.tx as SignAndSendTransactionsParams["transactions"],
          })
        },
        [ChainType.WebAuthn]: async () => {
          throw new Error("WebAuthn does not support transactions")
        },
        [ChainType.EVM]: async () => {
          throw new Error("EVM transactions not supported in learning edition")
        },
      }
      const fn = strategies[params.id]
      if (!fn) throw new Error(`Unsupported transaction chain: ${params.id}`)
      const result = await fn()
      if (result === undefined) {
        throw new Error(`Transaction failed for ${params.id}`)
      }
      return result
    },

    state,
  }
}

function useImpersonatedUser() {
  const searchParams = useSearchParams()
  const user = searchParams.get("user")
  if (user == null) return null
  const index = user.indexOf(":")
  return {
    chainType: user.slice(0, index) as ChainType,
    address: user.slice(index + 1),
    isVerified: true,
    isFake: true,
  }
}

class WalletDisconnectError extends BaseError {
  chainType: ChainType
  originalError?: Error

  constructor(chainType: ChainType, message: string, originalError?: Error) {
    super("Wallet sign out error", {
      cause: originalError,
      metaMessages: [`Chain type: ${chainType}`, `Message: ${message}`],
      name: "WalletDisconnectError",
    })
    this.chainType = chainType
    this.originalError = originalError
  }
}
