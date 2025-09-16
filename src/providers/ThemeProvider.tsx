"use client"

import { Theme } from "@radix-ui/themes"
import { ThemeProvider as NextThemesThemeProvider } from "next-themes"
import type { ReactNode } from "react"

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesThemeProvider attribute="class">
      <Theme accentColor="orange" hasBackground={false}>
        {children}
      </Theme>
    </NextThemesThemeProvider>
  )
}
