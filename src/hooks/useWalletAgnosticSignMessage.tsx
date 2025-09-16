import type { walletMessage as walletMessage_ } from "@defuse-protocol/internal-utils"
import { useWebAuthnActions } from "@src/features/webauthn/hooks/useWebAuthnStore"
import { ChainType, useConnectWallet } from "@src/hooks/useConnectWallet"
import { useNearWallet } from "@src/providers/NearWalletProvider"
import { createHotWalletCloseObserver, raceFirst } from "@src/utils/hotWalletIframe"
import { useSignMessage } from "wagmi"

export function useWalletAgnosticSignMessage() {
  const { state } = useConnectWallet()
  const { signMessage: signMessageNear } = useNearWallet()
  const { signMessageAsync: signMessageAsyncWagmi } = useSignMessage()
  const { signMessage: signMessageWebAuthn } = useWebAuthnActions()
  // Learning edition: only Near and WebAuthn supported

  return async (
    walletMessage: walletMessage_.WalletMessage
  ): Promise<walletMessage_.WalletSignatureResult> => {
    const chainType = state.chainType

    switch (chainType) {
      case ChainType.EVM: {
        const signatureData = await signMessageAsyncWagmi({
          message: walletMessage.ERC191.message,
        })
        return {
          type: "ERC191",
          signatureData,
          signedData: walletMessage.ERC191,
        }
      }

      case ChainType.Near: {
        const { signatureData, signedData } = await raceFirst(
          signMessageNear({
            ...walletMessage.NEP413,
            nonce: Buffer.from(walletMessage.NEP413.nonce),
          }),
          createHotWalletCloseObserver()
        )
        return { type: "NEP413", signatureData, signedData }
      }

      case ChainType.WebAuthn: {
        const signatureData = await signMessageWebAuthn(
          walletMessage.WEBAUTHN.challenge
        )
        return {
          type: "WEBAUTHN",
          signatureData,
          signedData: walletMessage.WEBAUTHN,
        }
      }

      // Other chains not supported in learning edition
      case undefined:
        throw new Error("User not signed in")

      default:
        throw new Error(`Unsupported sign in type: ${chainType}`)
    }
  }
}
