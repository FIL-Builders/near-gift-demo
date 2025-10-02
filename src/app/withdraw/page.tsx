"use client"
import { WithdrawWidget } from "@defuse-protocol/defuse-sdk"
import Paper from "@src/components/Paper"
import { LIST_TOKENS } from "@src/constants/tokens"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import { useIntentsReferral } from "@src/hooks/useIntentsReferral"
import { useTokenList } from "@src/hooks/useTokenList"
import { useWalletAgnosticSignMessage } from "@src/hooks/useWalletAgnosticSignMessage"
import { useNearWallet } from "@src/providers/NearWalletProvider"
import { renderAppLink } from "@src/utils/renderAppLink"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Image from "next/image";


function WithdrawContent() {
  const { state } = useConnectWallet()
  const signMessage = useWalletAgnosticSignMessage()
  const { signAndSendTransactions } = useNearWallet()
  const tokenList = useTokenList(LIST_TOKENS)
  const referral = useIntentsReferral()
  const queryParams = useSearchParams()
  const amount = queryParams.get("amount") ?? undefined
  const tokenSymbol = queryParams.get("token") ?? undefined
  const network = queryParams.get("network") ?? undefined
  const recipient = queryParams.get("recipient") ?? undefined

  const userAddress = state.isVerified ? state.address : undefined
  const userChainType = state.chainType

  return (
    <Paper>
      <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-8 w-full">
        <div className="max-w-sm sm:max-w-xl mx-auto p-2 sm:p-4">
          <div className="w-full">
            {/* Main Withdraw Card */}
            <div className="product-card w-full rounded-2xl sm:rounded-4xl shadow-xl overflow-hidden z-[100] relative cursor-pointer snap-start shrink-0 py-4 sm:py-8 px-3 sm:px-6 bg-white flex flex-col items-center justify-center gap-2 sm:gap-3 transition-all duration-300 group">
              
              {/* Circular Background Element */}
              <div className="absolute rounded-full bg-green-100 z-20 left-1/2 top-[44%] h-[110%] w-[110%] -translate-x-1/2 group-hover:top-[58%] transition-all duration-300"></div>
              
              {/* Withdraw Title */}
              <div className="para uppercase text-center leading-none z-40">
                <p className="font-bold text-lg sm:text-xl tracking-wider text-gray-11">Withdraw Funds</p>
              </div>
              
              {/* Withdraw Icon/Image */}
              <div className="img w-[120px] sm:w-[180px] aspect-square bg-gray-2 z-40 rounded-full flex items-center justify-center">
                <Image 
                  src="/static/icons/gift.png" 
                  alt="withdraw" 
                  width={60} 
                  height={60}
                  className="sm:w-[100px] sm:h-[100px]"
                />
              </div>
              
              {/* Withdraw Widget Container */}
              <div className="btm-_container z-40 flex flex-col justify-between items-center gap-2 sm:gap-4 w-full">
                <div className="w-full max-w-xs sm:max-w-md">
                  <WithdrawWidget
                    presetAmount={amount}
                    presetNetwork={network}
                    presetRecipient={recipient}
                    presetTokenSymbol={tokenSymbol}
                    tokenList={tokenList}
                    userAddress={userAddress}
                    displayAddress={state.isVerified ? state.displayAddress : undefined}
                    chainType={userChainType}
                    sendNearTransaction={async (tx) => {
                      const result = await signAndSendTransactions({ transactions: [tx] })

                      if (typeof result === "string") {
                        return { txHash: result }
                      }

                      const outcome = result[0]
                      if (!outcome) {
                        throw new Error("No outcome")
                      }

                      return { txHash: outcome.transaction.hash }
                    }}
                    signMessage={(params) => signMessage(params)}
                    renderHostAppLink={renderAppLink}
                    referral={referral}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Paper>
  )
}
export default function Withdraw() {
  return (
    <Suspense fallback={null}>
      <WithdrawContent />
    </Suspense>
  )
}
