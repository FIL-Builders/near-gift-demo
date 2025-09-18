"use client"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import Link from "next/link"

export default function AccountPage() {
  const { state } = useConnectWallet()
  const address = state.isVerified ? state.address : null

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <div className="rounded-xl border p-4 bg-gray-1">
        <div className="text-sm text-gray-11">Connected address</div>
        <div className="font-mono break-all text-lg">
          {address ?? "Not connected"}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/deposit" className="rounded-md bg-black px-4 py-2 text-white text-center">
          Deposit
        </Link>
        <Link href="/withdraw" className="rounded-md bg-black px-4 py-2 text-white text-center">
          Withdraw
        </Link>
      </div>
    </main>
  )
}
