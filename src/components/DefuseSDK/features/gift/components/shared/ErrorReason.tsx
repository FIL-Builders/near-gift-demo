import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Callout } from "@radix-ui/themes"
import { APP_ENV } from "@src/utils/environment"

type ErrorReasonProps = {
  reason: string
}

export function ErrorReason({ reason }: ErrorReasonProps) {
  return (
    <Callout.Root size="1" color="red" className="flex items-center gap-2">
      <Callout.Icon>
        <ExclamationTriangleIcon />
      </Callout.Icon>
      <Callout.Text>
        {renderErrorMessages(reason)}
        {APP_ENV === "development" && reason && ` [code: ${reason}]`}
      </Callout.Text>
    </Callout.Root>
  )
}

function renderErrorMessages(reason: string): string {
  switch (reason) {
    case "RELAY_PUBLISH_INSUFFICIENT_BALANCE":
      return "This gift has already been claimed by someone else. Please try another gift or create a new one."

    case "ERR_STORAGE_OPERATION_EXCEPTION":
    case "EXCEPTION":
      return (
        "Something went wrong while creating the gift link. " +
        "If this persists, verify the API and server configuration (e.g., SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) and try again."
      )

    case "ERR_SET_ITEM_FAILED_TO_STORAGE":
      return "Unable to save your gift. Please try again in a moment."

    case "ERR_UPDATE_ITEM_FAILED_TO_STORAGE":
      return "Unable to update your gift. Please try again in a moment."

    case "ERR_REMOVE_ITEM_FAILED_FROM_STORAGE":
      return "Unable to remove your gift. Please try again in a moment."

    case "ERR_GIFT_PUBLISHING":
      return "Unable to publish your gift. Please try again in a moment."

    case "ERR_GIFT_PUBLISHING_TIMEOUT":
      return "Publishing took too long. Your gift was not published. Please try again in a moment."

    case "ERR_GIFT_SIGNING":
      return "Unable to sign your gift. Please try again in a moment."
    case "ERR_USER_DIDNT_SIGN":
      return "Signature not completed. Please sign in your wallet and try again."

    case "ERR_CANNOT_VERIFY_SIGNATURE":
      return "Could not verify the wallet signature. Please retry signing."

    case "ERR_PUBKEY_EXCEPTION":
      return "Could not verify NEAR public key presence. Please retry or check network."

    case "ERR_INTENT_SETTLEMENT_TIMEOUT":
      return "Settlement is taking longer than expected. Please check later or try again."

    case "NOT_FOUND_OR_NOT_VALID":
    case "NO_TOKEN_OR_GIFT_HAS_BEEN_CLAIMED":
      return "This gift is no longer available. It may have been claimed by someone else or the link is invalid. Please contact the gift creator for assistance."

    case "INVALID_SECRET_KEY":
      return "This gift link is invalid. Please contact the gift creator for assistance."

    default:
      return "Something went wrong while creating the gift link. Please check your internet connection or try again shortly."
  }
}
