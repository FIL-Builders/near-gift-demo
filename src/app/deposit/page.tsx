"use client"
import { Suspense } from "react"
import { DepositWidget } from "@defuse-protocol/defuse-sdk"
import { LIST_TOKENS } from "@src/constants/tokens"
import { useConnectWallet, ChainType } from "@src/hooks/useConnectWallet"
import { useTokenList } from "@src/hooks/useTokenList"
import { useNearWallet } from "@src/providers/NearWalletProvider"
import Paper from "@src/components/Paper"

function DepositContent() {
  const { state } = useConnectWallet()
  const { signAndSendTransactions } = useNearWallet()
  const tokenList = useTokenList(LIST_TOKENS)

  return (
    <Paper>
      <DepositWidget
        tokenList={tokenList}
        userAddress={state.isVerified ? state.address : null}
        chainType={(state.chainType as ChainType) ?? null}
        sendTransactionNear={async (txs) => {
          const result = await signAndSendTransactions({ transactions: txs })
          if (typeof result === "string") return result
          const outcome = result?.[0]
          return outcome ? outcome.transaction.hash : null
        }}
        // Not wired in this demo
        sendTransactionEVM={async () => Promise.resolve(null)}
        sendTransactionSolana={async () => Promise.resolve(null)}
      />
    </Paper>
  )
}

export default function DepositPage() {
  return (
    <Suspense fallback={null}>
      <DepositContent />
    </Suspense>
  )
}
