"use client"
import { Suspense } from "react"
import { WithdrawWidget } from "@defuse-protocol/defuse-sdk"
import { LIST_TOKENS } from "@src/constants/tokens"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import { useIntentsReferral } from "@src/hooks/useIntentsReferral"
import { useTokenList } from "@src/hooks/useTokenList"
import { useWalletAgnosticSignMessage } from "@src/hooks/useWalletAgnosticSignMessage"
import { useNearWallet } from "@src/providers/NearWalletProvider"
import Paper from "@src/components/Paper"

function WithdrawContent() {
  const { state } = useConnectWallet()
  const signMessage = useWalletAgnosticSignMessage()
  const { signAndSendTransactions } = useNearWallet()
  const tokenList = useTokenList(LIST_TOKENS)
  const referral = useIntentsReferral()

  const userAddress = state.isVerified ? state.address : undefined

  return (
    <Paper>
      <WithdrawWidget
        tokenList={tokenList}
        userAddress={userAddress ?? null}
        signMessage={(params) => signMessage(params)}
        sendNearTransaction={async (tx) => {
          const result = await signAndSendTransactions({ transactions: [tx] })
          if (typeof result === "string") return { txHash: result }
          const outcome = result?.[0]
          if (!outcome) return { txHash: "" }
          return { txHash: outcome.transaction.hash }
        }}
        referral={referral}
      />
    </Paper>
  )
}

export default function WithdrawPage() {
  return (
    <Suspense fallback={null}>
      <WithdrawContent />
    </Suspense>
  )
}
