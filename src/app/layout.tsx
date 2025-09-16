import { GoogleAnalytics } from "@next/third-parties/google"
import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { Suspense } from "react"
import ClientProviders from "./ClientProviders"

// Client providers are imported as a client component boundary

import "@radix-ui/themes/styles.css"
import "../styles/global.scss"
import Helpscout from "@src/components/Helpscout"
import {
  HELPSCOUT_BEACON_ID,
  VERCEL_PROJECT_PRODUCTION_URL,
} from "@src/utils/environment"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: VERCEL_PROJECT_PRODUCTION_URL,
  title: "NEAR Intents",
  description: "Learning edition of Defuse Frontend",
  icons: {
    icon: "/favicons/near-intents/favicon-32x32.png",
    apple: "/favicons/near-intents/apple-touch-icon.png",
  },
  manifest: "/favicons/near-intents/site.webmanifest",
}

const RootLayout = async ({
  children,
}: Readonly<{
  children?: ReactNode
}>) => {
  return (
    <html lang="en" suppressHydrationWarning className={"tmpl-near-intents"}>
      <body>
        <Suspense fallback={null}>
          <ClientProviders>{children}</ClientProviders>
        </Suspense>
      </body>
      <GoogleAnalytics gaId="G-WNE3NB46KM" />
      {HELPSCOUT_BEACON_ID && <Helpscout />}
    </html>
  )
}

export default RootLayout
