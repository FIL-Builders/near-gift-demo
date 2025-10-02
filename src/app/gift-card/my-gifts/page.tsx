"use client";
import { GiftHistoryWidget } from "@src/components/DefuseSDK/features/gift/components/GiftHistoryWidget";
import Paper from "@src/components/Paper";
import { LIST_TOKENS } from "@src/constants/tokens";
import { useConnectWallet } from "@src/hooks/useConnectWallet";
import { useTokenList } from "@src/hooks/useTokenList";
import Image from "next/image";
import { Suspense } from "react";
import { createGiftLink } from "../_utils/link";

function CreateGiftContent() {
  const { state } = useConnectWallet();
  const tokenList = useTokenList(LIST_TOKENS);

  return (
    <Paper>
      <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-8 w-full">
        <div className="max-w-sm sm:max-w-xl mx-auto p-2 sm:p-4">
          <div className="w-full">
            {/* Main My Gifts Card */}
            <div className="product-card w-full rounded-2xl sm:rounded-4xl shadow-xl overflow-hidden z-[100] relative cursor-pointer snap-start shrink-0 py-4 sm:py-8 px-3 sm:px-6 bg-white flex flex-col items-center justify-center gap-2 sm:gap-3 transition-all duration-300 group">

              {/* Circular Background Element */}
              <div className="absolute -z-[100] rounded-full bg-green-100 z-20 left-1/2 top-[44%] h-[110%] w-[110%] -translate-x-1/2 group-hover:top-[58%] transition-all duration-300"></div>

              {/* My Gifts Title */}
              <div className="para uppercase text-center leading-none z-40">
                <p className="font-bold text-lg sm:text-xl tracking-wider text-gray-11">My Gifts</p>
              </div>

              {/* Gift Icon/Image */}
              <div className="img w-[120px] sm:w-[180px] aspect-square bg-gray-2 z-40 rounded-full flex items-center justify-center">
                <Image
                  src="/static/icons/gift.png"
                  alt="gift"
                  width={60}
                  height={60}
                  className="sm:w-[100px] sm:h-[100px]"
                />
              </div>
              <div className="z-500">
                <GiftHistoryWidget
                  tokenList={tokenList}
                  userAddress={state.isVerified ? state.address : undefined}
                  userChainType={state.chainType}
                  generateLink={(giftLinkData) => createGiftLink(giftLinkData)}
                />
              </div>

            </div>
          </div>
        </div>


      </div>
    </Paper>
  );
}
export default function CreateGiftPage() {
  return (
    <Suspense fallback={null}>
      <CreateGiftContent />
    </Suspense>
  );
}
