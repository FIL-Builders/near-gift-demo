"use client";
import { Suspense } from "react";
import { DepositWidget } from "@defuse-protocol/defuse-sdk";
import Paper from "@src/components/Paper";
import { LIST_TOKENS } from "@src/constants/tokens";
import { ChainType, useConnectWallet } from "@src/hooks/useConnectWallet";
import { useTokenList } from "@src/hooks/useTokenList";
import { renderAppLink } from "@src/utils/renderAppLink";
import Image from "next/image";

function DepositContent() {
  const { state, sendTransaction } = useConnectWallet();
  const tokenList = useTokenList(LIST_TOKENS);

  return (
    <Paper>
      <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-8 w-full">
        <div className="max-w-sm sm:max-w-xl mx-auto p-2 sm:p-4">
          <div className="w-full">
            {/* Main Deposit Card */}
            <div className="product-card w-full rounded-2xl sm:rounded-4xl shadow-xl overflow-hidden z-[100] relative cursor-pointer snap-start shrink-0 py-4 sm:py-8 px-3 sm:px-6 bg-white flex flex-col items-center justify-center gap-2 sm:gap-3 transition-all duration-300 group">
              
              {/* Circular Background Element */}
              <div className="absolute rounded-full bg-green-100 z-20 left-1/2 top-[44%] h-[110%] w-[110%] -translate-x-1/2 group-hover:top-[58%] transition-all duration-300"></div>
              
              {/* Deposit Title */}
              <div className="para uppercase text-center leading-none z-40">
                <p className="font-bold text-lg sm:text-xl tracking-wider text-gray-11">Deposit Funds</p>
              </div>
              
              {/* Deposit Icon/Image */}
              <div className="img w-[120px] sm:w-[180px] aspect-square bg-gray-2 z-40 rounded-full flex items-center justify-center">
                <Image 
                  src="/static/icons/gift.png" 
                  alt="deposit" 
                  width={60} 
                  height={60}
                  className="sm:w-[100px] sm:h-[100px]"
                />
              </div>
              
              {/* Deposit Widget Container */}
              <div className="btm-_container z-40 flex flex-col justify-between items-center gap-2 sm:gap-4 w-full">
                <div className="w-full max-w-xs sm:max-w-md">
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
                      });
                      return Array.isArray(result) ? result[0].transaction.hash : result;
                    }}
                    sendTransactionEVM={async () => Promise.reject("Unsupported chain")}
                    sendTransactionSolana={async () => Promise.reject("Unsupported chain")}
                    sendTransactionTon={async () => Promise.reject("Unsupported chain")}
                    sendTransactionStellar={async () => Promise.reject("Unsupported chain")}
                    sendTransactionTron={async () => Promise.reject("Unsupported chain")}
                    renderHostAppLink={renderAppLink}
                    // initialToken omitted; simplified URL handling for learning edition
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Paper>
  );
}
export default function Deposit() {
  return (
    <Suspense fallback={null}>
      <DepositContent />
    </Suspense>
  );
}
