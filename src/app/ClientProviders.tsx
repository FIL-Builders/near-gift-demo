"use client"
import { InitDefuseSDK } from "@src/components/InitDefuseSDK"
import { SentryTracer } from "@src/components/SentryTracer"
import { config as wagmiConfig } from "@src/config/wagmi"
import queryClient from "@src/constants/queryClient"
import { WebAuthnProvider } from "@src/features/webauthn/providers/WebAuthnProvider"
import { MixpanelProvider } from "@src/providers/MixpanelProvider"
import { NearWalletProvider } from "@src/providers/NearWalletProvider"
import { ThemeProvider } from "@src/providers/ThemeProvider"
import { APP_ENV } from "@src/utils/environment"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { ReactNode } from "react"
import { WagmiProvider } from "wagmi"

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <InitDefuseSDK />
      <ThemeProvider>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <NearWalletProvider>
              <WebAuthnProvider>
                <MixpanelProvider>{children}</MixpanelProvider>
              </WebAuthnProvider>
              <SentryTracer />
            </NearWalletProvider>
            {APP_ENV === "development" && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </>
  )
}
