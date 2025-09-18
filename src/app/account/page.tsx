"use client"
import { Suspense } from "react"

import { AccountWidget } from "@src/components/DefuseSDK/features/account/components/AccountWidget"

import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import { useTokenList } from "@src/hooks/useTokenList"
import { renderAppLink } from "@src/utils/renderAppLink"

function AccountContent() {
  const { state } = useConnectWallet()
  const tokenList = useTokenList(LIST_TOKENS)

  return (
    <Paper>
      <AccountWidget
        tokenList={tokenList}
        userAddress={(state.isVerified ? state.address : undefined) ?? null}
        userChainType={state.chainType ?? null}
        renderHostAppLink={renderAppLink}
      />
    </Paper>
  )
}
export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountContent />
    </Suspense>
  )
}
