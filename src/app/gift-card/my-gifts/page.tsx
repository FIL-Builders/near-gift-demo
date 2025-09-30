"use client";
import { GiftHistoryWidget } from "@src/components/DefuseSDK/features/gift/components/GiftHistoryWidget";
import Paper from "@src/components/Paper";
import { LIST_TOKENS } from "@src/constants/tokens";
import { useConnectWallet } from "@src/hooks/useConnectWallet";
import { useTokenList } from "@src/hooks/useTokenList";

import { Suspense } from "react";
import { createGiftLink } from "../_utils/link";

function CreateGiftContent() {
  const { state } = useConnectWallet();
  const tokenList = useTokenList(LIST_TOKENS);

  return (
    <Paper>
      <div className="flex flex-col items-center gap-8 w-full">
        <GiftHistoryWidget
          tokenList={tokenList}
          userAddress={state.isVerified ? state.address : undefined}
          userChainType={state.chainType}
          generateLink={(giftLinkData) => createGiftLink(giftLinkData)}
        />
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
