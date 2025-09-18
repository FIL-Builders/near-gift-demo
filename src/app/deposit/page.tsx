"use client"
import { Suspense } from "react"

import { DepositWidget } from "@src/components/DefuseSDK/features/deposit/components/DepositWidget"
import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { ChainType, useConnectWallet } from "@src/hooks/useConnectWallet"
import { useTokenList } from "@src/hooks/useTokenList"
import { renderAppLink } from "@src/utils/renderAppLink"
import { useRouter, useSearchParams } from "next/navigation"

function DepositContent() {
  const { state, sendTransaction } = useConnectWallet()
  const tokenList = useTokenList(LIST_TOKENS)
  const _router = useRouter()
  const _searchParams = useSearchParams()

  return (
    <Paper>
      <DepositWidget
        tokenList={tokenList}
        userAddress={state.isVerified ? state.address : undefined}
        userWalletAddress={
          state.isVerified &&
          state.chainType !== ChainType.WebAuthn &&
          state.displayAddress
            ? state.displayAddress
            : null
        }
        chainType={state.chainType}
        sendTransactionNear={async (tx) => {
          const result = await sendTransaction({
            id: ChainType.Near,
            tx,
          })
          return Array.isArray(result) ? result[0].transaction.hash : result
        }}
        sendTransactionEVM={async () => Promise.reject("Unsupported chain")}
        sendTransactionSolana={async () => Promise.reject("Unsupported chain")}
        sendTransactionTon={async () => Promise.reject("Unsupported chain")}
        sendTransactionStellar={async () => Promise.reject("Unsupported chain")}
        sendTransactionTron={async () => Promise.reject("Unsupported chain")}
        renderHostAppLink={renderAppLink}
        // initialToken omitted; simplified URL handling for learning edition
      />
    </Paper>
  )
}
export default function Deposit() {
  return (
    <Suspense fallback={null}>
      <DepositContent />
    </Suspense>
  )
}
