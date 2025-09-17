import { type ReactNode, createContext, useContext, useMemo, useState } from "react"

export enum ModalType {
  MODAL_SELECT_ASSETS = "modalSelectAssets",
  MODAL_CONFIRM_ADD_PUBKEY = "modalConfirmAddPubKey",
  MODAL_SELECT_NETWORK = "modalSelectNetwork",
}

type ModalContext = {
  modalType: ModalType | null
  payload?: unknown
  setModalType: (modalType: ModalType | null, payload?: unknown) => void
  onCloseModal: (payload?: unknown) => void
}

const ModalStoreContext = createContext<ModalContext | null>(null)

export interface ModalStoreProviderProps {
  children: ReactNode
}

export const ModalStoreProvider = ({ children }: ModalStoreProviderProps) => {
  const [modalType, setModalType_] = useState<ModalType | null>(null)
  const [payload, setPayload] = useState<unknown>(undefined)

  const value: ModalContext = useMemo(
    () => ({
      modalType,
      payload,
      setModalType: (type, p) => {
        setModalType_(type)
        setPayload(p)
      },
      onCloseModal: (p) => {
        setModalType_(null)
        if (p !== undefined) setPayload(p)
        else setPayload(undefined)
      },
    }),
    [modalType, payload]
  )

  return (
    <ModalStoreContext.Provider value={value}>{children}</ModalStoreContext.Provider>
  )
}

export const useModalStore = (): ModalContext => {
  const ctx = useContext(ModalStoreContext)
  if (!ctx) throw new Error("useModalStore must be used within ModalStoreProvider")
  return ctx
}
