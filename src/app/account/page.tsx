"use client";
import { useConnectWallet } from "@src/hooks/useConnectWallet";
import { ButtonCustom as CustomButton } from "@src/components/DefuseSDK/components/Button/ButtonCustom";
import { useRouter } from "next/navigation";
import { navigation } from "@src/constants/routes";

export default function AccountPage() {
  const { state } = useConnectWallet();
  const address = state.isVerified ? state.address : null;
  const router = useRouter();
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <div className="rounded-xl border p-4 bg-gray-1">
        <div className="text-sm text-gray-11">Connected address</div>
        <div className="font-mono text-lg max-w-full break-all line-clamp-1">
          {address ?? "Not connected"}
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 grid-cols-1 gap-3">
        <CustomButton onClick={() => router.push(navigation.deposit)}>
          Deposit
        </CustomButton>
        <CustomButton onClick={() => router.push(navigation.withdraw)}>
          Withdraw
        </CustomButton>
        <CustomButton onClick={() => router.push(navigation.gift)}>
          Gift
        </CustomButton>
      </div>
    </main>
  );
}
