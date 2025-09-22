"use client"
import Logo from "@src/components/Logo"
import Settings from "@src/components/Settings"
import ConnectWallet from "@src/components/Wallet"
import { FeatureFlagsContext } from "@src/providers/FeatureFlagsProvider"
import type React from "react"
import { type ReactNode, useContext } from "react"
import styles from "./Header.module.css"

export function Header({
  navbarSlot,
  depositSlot,
}: {
  navbarSlot?: ReactNode
  depositSlot?: ReactNode
}) {
  const { whitelabelTemplate } = useContext(FeatureFlagsContext)

  return (
    <>
      <header
        className={`h-[56px] fixed top-0 left-0 w-full md:relative `}
      >
        <div className="h-full flex justify-between items-center px-3">
          <div className="flex-shrink-0">
            <Logo />
            <ConnectWallet/>
          </div>
        </div>
      </header>
      <div className="block md:hidden h-[56px]" />
    </>
  )
}

Header.DisplayNavbar = function DisplayNavbar({
  children,
}: {
  children: ReactNode
}) {
  return <div className="hidden md:flex flex-1 justify-center">{children}</div>
}

Header.DepositSlot = function DepositSlot({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="hidden md:flex items-center justify-between">
      {children}
      <div className="h-[20px] w-[1px] bg-gray-5 ml-4" />
    </div>
  )
}
