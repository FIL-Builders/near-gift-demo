import type { ReactNode } from "react"
import { ModalContainer } from "../components/Modal/ModalContainer"
import { ModalStoreProvider } from "./ModalStoreProvider"

export const SwapWidgetProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ModalStoreProvider>
      {children}
      <ModalContainer />
    </ModalStoreProvider>
  )
}
