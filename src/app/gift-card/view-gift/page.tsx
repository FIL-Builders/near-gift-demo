"use client"
import { Suspense } from "react"

import { GiftTakerWidget } from "@src/components/DefuseSDK/features/gift/components/GiftTakerWidget"
import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import { useTokenList } from "@src/hooks/useTokenList"
import { renderAppLink } from "@src/utils/renderAppLink"

import { useGiftIntent } from "../_utils/link"

function ViewGiftContent() {
  const { state } = useConnectWallet()
  const tokenList = useTokenList(LIST_TOKENS)
  const { payload, giftId, imageCid } = useGiftIntent()

  return (
    <Paper>
      {/* @ts-expect-error TODO: Enable in next @defuse-protocol/defuse-sdk release */}
      <GiftTakerWidget
        giftId={giftId}
        payload={payload}
        imageCid={imageCid}
        tokenList={tokenList}
        userAddress={state.isVerified ? state.address : undefined}
        userChainType={state.chainType}
        renderHostAppLink={renderAppLink}
      />
    </Paper>
  )
}
export default function ViewGiftPage() {
  return (
    <Suspense fallback={null}>
      <ViewGiftContent />
    </Suspense>
  )
}
