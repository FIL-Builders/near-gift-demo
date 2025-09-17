import { useModalStore, ModalType } from "../../providers/ModalStoreProvider"

import { ModalConfirmAddPubkey } from "./ModalConfirmAddPubkey"
import { ModalSelectAssets } from "./ModalSelectAssets"

export const ModalContainer = () => {
  const { modalType } = useModalStore()

  switch (modalType) {
    case ModalType.MODAL_SELECT_ASSETS:
      return <ModalSelectAssets />
    case ModalType.MODAL_CONFIRM_ADD_PUBKEY:
      return <ModalConfirmAddPubkey />
    default:
      return null
  }
}
