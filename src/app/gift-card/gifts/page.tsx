"use client"
import { GiftHistoryWidget } from "@src/components/DefuseSDK/features/gift/components/GiftHistoryWidget"
import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import { useIntentsReferral } from "@src/hooks/useIntentsReferral"
import { useTokenList } from "@src/hooks/useTokenList"
import { useWalletAgnosticSignMessage } from "@src/hooks/useWalletAgnosticSignMessage"
import { useNearWallet } from "@src/providers/NearWalletProvider"
import { Suspense } from "react"
import { createGiftIntent, createGiftLink } from "../_utils/link"

function CreateGiftContent() {
  const { state } = useConnectWallet()
  const tokenList = useTokenList(LIST_TOKENS)

  return (
    <Paper>
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="w-full max-w-xl fixed right-10 mr-36 mt-64 flex justify-end items-end">
          <GiftHistoryWidget
            tokenList={tokenList}
            userAddress={state.isVerified ? state.address : undefined}
            userChainType={state.chainType}
            generateLink={(giftLinkData) => createGiftLink(giftLinkData)}
          />
        </div>
      </div>
    </Paper>
  )
}
export default function GiftsPage() {
  return (
    <Suspense fallback={null}>
      <CreateGiftContent />
    </Suspense>
  )
}
