import { setUser } from "@sentry/nextjs"
import { useNearWallet } from "@src/providers/NearWalletProvider"
import { useEffect } from "react"
import { useConnectWallet } from "./useConnectWallet"

export const useSentrySetUser = () => {
  const { connector: nearWallet } = useNearWallet()
  const { state: userConnectionState } = useConnectWallet()

  useEffect(() => {
    const abortCtrl = new AbortController()

    void getUserDetails().then((user) => {
      if (abortCtrl.signal.aborted) return
      setUser(user)
    })

    return () => {
      abortCtrl.abort()
    }

    async function getUserDetails() {
      // This is a special case, since for faked user there is no wallet info
      if (userConnectionState.isFake) {
        return null
      }

      let walletProvider: string | undefined = undefined
      let walletAppName: string | undefined = undefined

      if (userConnectionState.chainType === "near") {
        if (nearWallet) {
          const wallet = await nearWallet.wallet()
          walletProvider = "near"
          walletAppName = wallet.manifest.name
        } else {
          walletProvider = "near"
        }
      } else if (userConnectionState.chainType === "webauthn") {
        walletProvider = "webauthn"
        walletAppName = "passkey"
      }

      return {
        id: userConnectionState.address,
        walletChainType: userConnectionState.chainType,
        walletProvider,
        walletAppName,
      }
    }
  }, [nearWallet, userConnectionState])
}
