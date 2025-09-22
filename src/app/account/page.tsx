"use client"
import { useConnectWallet } from "@src/hooks/useConnectWallet"
import Link from "next/link"
import ConnectWallet from "@src/components/Wallet"

export default function AccountPage() {
  const { state } = useConnectWallet()
  const address = state.isVerified ? state.address : null

  return (
    <main className="min-h-screen flex flex-col items-end justify-end p-6 fixed right-10 bottom-10">
      <div className="flex flex-row justify-center items-end text-center mb-12">
        <h1 className="text-9xl font-bold text-sky-500 mb-2">Hi 👋</h1>
        <div className="text-4xl font-semibold text-sky-700 mb-4 ml-6">
        <ConnectWallet />
        </div>
      </div>

      {address == null ? <> </> : <div className="mt-8 grid grid-cols-2 gap-6">
        <button
          className="relative text-center flex items-center px-8 py-4 overflow-hidden font-medium transition-all bg-sky-500 rounded-md group text-lg"
        >
          <span
            className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-sky-700 rounded group-hover:-mr-4 group-hover:-mt-4"
          >
            <span
              className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"
            ></span>
          </span>
          <span
            className="absolute bottom-0 rotate-180 left-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-sky-700 rounded group-hover:-ml-4 group-hover:-mb-4"
          >
            <span
              className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"
            ></span>
          </span>
          <span
            className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full bg-sky-600 rounded-md group-hover:translate-x-0"
          ></span>
          <span
            className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-white"
          >
            <Link href="/withdraw" >
              Withdraw
            </Link>
          </span>
        </button>


        <button
          className="relative text-center flex items-center px-8 py-4 overflow-hidden font-medium transition-all bg-sky-500 rounded-md group text-lg"
        >
          <span
            className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-sky-700 rounded group-hover:-mr-4 group-hover:-mt-4"
          >
            <span
              className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"
            ></span>
          </span>
          <span
            className="absolute bottom-0 rotate-180 left-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-sky-700 rounded group-hover:-ml-4 group-hover:-mb-4"
          >
            <span
              className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"
            ></span>
          </span>
          <span
            className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full bg-sky-600 rounded-md group-hover:translate-x-0"
          ></span>
          <span
            className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-white"
          > <Link
            href="/gift-card/create-gift"

          >
              Wrap A Gift
            </Link></span>
        </button>

      </div>}

      

    </main>
  )
}
