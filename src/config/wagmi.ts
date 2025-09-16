"use client"

import { injected } from "@wagmi/core"
import { http, createConfig } from "wagmi"
import { mainnet } from "wagmi/chains"

export const config = createConfig({
  chains: [mainnet],
  // Learning edition: no EVM connectors to avoid IndexedDB from walletconnect
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
})
