"use client"
import type { authHandle } from "@defuse-protocol/internal-utils"
import { useActorRef, useSelector } from "@xstate/react"
import clsx from "clsx"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ActorRefFrom, PromiseActorLogic } from "xstate"
import { AuthGate } from "../../../components/AuthGate"
import { BlockMultiBalances } from "../../../components/Block/BlockMultiBalances"
import type { ModalSelectAssetsPayload } from "../../../components/Modal/ModalSelectAssets"
import { SelectAssets } from "../../../components/SelectAssets"
import type { SignerCredentials } from "../../../core/formatters"
import { useModalStore, ModalType } from "../../../providers/ModalStoreProvider"
import type { BaseTokenInfo, UnifiedTokenInfo } from "../../../types/base"
import type { RenderHostAppLink } from "../../../types/hostAppLink"
import type { SwappableToken } from "../../../types/swap"
import { assert } from "../../../utils/assert"
import { formatTokenValue, formatUsdAmount } from "../../../utils/format"
import { TokenAmountInputCard } from "../../deposit/components/DepositForm/TokenAmountInputCard"
import { balanceAllSelector } from "../../machines/depositedBalanceMachine"
import type { SendNearTransaction } from "../../machines/publicKeyVerifierMachine"
import type { publicKeyVerifierMachine } from "../../machines/publicKeyVerifierMachine"
// Learning edition: swap public key modal opener removed
import { formValuesSelector } from "../actors/giftMakerFormMachine"
import type { giftMakerReadyActor } from "../actors/giftMakerReadyActor"
import { giftMakerRootMachine } from "../actors/giftMakerRootMachine"
import type { giftMakerSignActor } from "../actors/giftMakerSignActor"
import type {
  GiftMakerSignActorInput,
  GiftMakerSignActorOutput,
} from "../actors/giftMakerSignActor"
import { useBalanceUpdaterSyncWithHistory } from "../hooks/useBalanceUpdaterSyncWithHistory"
import { useCheckSignerCredentials } from "../hooks/useCheckSignerCredentials"
import type {
  CreateGiftIntent,
  GenerateLink,
  SignMessage,
} from "../types/sharedTypes"
import { checkInsufficientBalance, getButtonText } from "../utils/makerForm"
import { GiftMakerReadyDialog } from "./GiftMakerReadyDialog"
import { GiftMessageInput } from "./GiftMessageInput"
import { ErrorReason } from "./shared/ErrorReason"
import { GiftDescription } from "./shared/GiftDescription"
import { GiftHeader } from "./shared/GiftHeader"

export type GiftMakerWidgetProps = {
  /** List of available tokens for trading */
  tokenList: (BaseTokenInfo | UnifiedTokenInfo)[]

  /** User's wallet address */
  userAddress: authHandle.AuthHandle["identifier"] | undefined
  chainType: authHandle.AuthHandle["method"] | undefined

  /** Initial tokens for pre-filling the form */
  initialToken?: BaseTokenInfo | UnifiedTokenInfo

  /** Sign message callback */
  signMessage: SignMessage

  /** Send NEAR transaction callback */
  sendNearTransaction: SendNearTransaction

  /** Create Gift in the database */
  createGiftIntent: CreateGiftIntent

  /** Function to generate a shareable trade link */
  generateLink: GenerateLink

  /** Theme selection */
  theme?: "dark" | "light"

  /** Frontend referral */
  referral?: string

  renderHostAppLink: RenderHostAppLink
}

const MAX_MESSAGE_LENGTH = 500

export function GiftMakerForm({
  tokenList,
  userAddress,
  chainType,
  initialToken,
  signMessage,
  sendNearTransaction,
  generateLink,
  referral,
  renderHostAppLink,
  createGiftIntent,
}: GiftMakerWidgetProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const signerCredentials: SignerCredentials | null = useMemo(
    () =>
      userAddress != null && chainType != null
        ? {
          credential: userAddress,
          credentialType: chainType,
        }
        : null,
    [userAddress, chainType]
  )
  const isLoggedIn = signerCredentials != null

  const initialToken_ = initialToken ?? tokenList[0]
  assert(initialToken_ !== undefined, "Token list must not be empty")

  const rootActorRef = useActorRef(giftMakerRootMachine, {
    input: {
      initialToken: initialToken_,
      tokenList,
      referral,
      createGiftIntent,
    },
  })

  const formRef = useSelector(rootActorRef, (s) => s.context.formRef)
  const formValuesRef = useSelector(formRef, formValuesSelector)
  const formValues = useSelector(formValuesRef, (s) => s.context)

  const { tokenBalance } = useSelector(
    useSelector(rootActorRef, (s) => s.context.depositedBalanceRef),
    balanceAllSelector({
      tokenBalance: formValues.token,
    })
  )

  const rootSnapshot = useSelector(rootActorRef, (s) => s)
  const { readyGiftRef } = useSelector(rootActorRef, (s) => ({
    readyGiftRef: s.children.readyGiftRef as unknown as
      | undefined
      | ActorRefFrom<typeof giftMakerReadyActor>,
  }))

  useCheckSignerCredentials(rootActorRef, signerCredentials)
  useBalanceUpdaterSyncWithHistory(rootActorRef, signerCredentials)

  const usdAmount = null

  const { setModalType, payload } = useModalStore()

  const openModalSelectAssets = (
    fieldName: string,
    token: SwappableToken | undefined
  ) => {
    setModalType(ModalType.MODAL_SELECT_ASSETS, {
      ...(payload as ModalSelectAssetsPayload),
      fieldName,
      tokenList,
      [fieldName]: token,
      isHoldingsEnabled: true,
    })
  }

  useEffect(() => {
    if (
      (payload as ModalSelectAssetsPayload)?.modalType !==
      ModalType.MODAL_SELECT_ASSETS
    ) {
      return
    }

    const { modalType, fieldName } = payload as ModalSelectAssetsPayload
    const _payload = payload as ModalSelectAssetsPayload
    const token = _payload[fieldName || "token"]
    if (modalType === ModalType.MODAL_SELECT_ASSETS && fieldName && token) {
      ; (formValuesRef as any).trigger.updateToken({ value: token })
    }
  }, [payload, formValuesRef])

  const balanceInsufficient = useMemo(() => {
    if (!tokenBalance) {
      return false
    }
    return checkInsufficientBalance(formValues.amount, tokenBalance)
  }, [formValues.amount, tokenBalance])

  const editing = (rootSnapshot as any).matches("editing")
  const processing =
    (rootSnapshot as any).matches("signing") ||
    (rootSnapshot as any).matches("saving") ||
    (rootSnapshot as any).matches("publishing") ||
    (rootSnapshot as any).matches("updating") ||
    (rootSnapshot as any).matches("settling") ||
    (rootSnapshot as any).matches("removing")

  const processingLabel = (() => {
    if ((rootSnapshot as any).matches("signing")) return "Signing…"
    if ((rootSnapshot as any).matches("saving")) return "Saving…"
    if ((rootSnapshot as any).matches("publishing")) return "Publishing…"
    if ((rootSnapshot as any).matches("settling")) return "Waiting for settlement…"
    if ((rootSnapshot as any).matches("updating")) return "Finalizing…"
    if ((rootSnapshot as any).matches("removing")) return "Cleaning up…"
    return null
  })()

  const error = rootSnapshot.context.error

  const _publicKeyVerifierRef = useSelector(
    useSelector(
      useSelector(
        rootActorRef,
        (state) =>
          state.children.signRef as
          | undefined
          | ActorRefFrom<typeof giftMakerSignActor>
      ),
      (state) => {
        if (state) {
          return (
            state as unknown as {
              children: {
                signRef: ActorRefFrom<
                  PromiseActorLogic<
                    GiftMakerSignActorOutput,
                    GiftMakerSignActorInput
                  >
                >
              }
            }
          ).children.signRef
        }
      }
    ),
    (state) => {
      if (state) {
        return (
          state as unknown as {
            children: {
              publicKeyVerifierRef: ActorRefFrom<
                typeof publicKeyVerifierMachine
              >
            }
          }
        ).children.publicKeyVerifierRef
      }
    }
  )

  // Auto-add public key when the verifier reports it's missing (Near accounts only)
  const publicKeyVerifierSnapshot = useSelector(
    _publicKeyVerifierRef ?? undefined,
    (s) => s
  )

  useEffect(() => {
    if ((publicKeyVerifierSnapshot as any)?.matches("checked")) {
      _publicKeyVerifierRef?.send({
        type: "ADD_PUBLIC_KEY",
        sendNearTransaction,
      })
    }
  }, [publicKeyVerifierSnapshot, _publicKeyVerifierRef, sendNearTransaction])

  const handleSetMaxValue = async () => {
    if (tokenBalance != null) {
      ; (formValuesRef as any).trigger.updateAmount({
        value: formatTokenValue(tokenBalance.amount, tokenBalance.decimals),
      })
    }
  }

  const handleSetHalfValue = async () => {
    if (tokenBalance != null) {
      ; (formValuesRef as any).trigger.updateAmount({
        value: formatTokenValue(
          tokenBalance.amount / 2n,
          tokenBalance.decimals
        ),
      })
    }
  }

  const balanceAmount = tokenBalance?.amount ?? 0n
  const disabled = tokenBalance?.amount === 0n

  // Step navigation helpers
  const canProceedToStep2 = () => {
    return formValues.amount && formValues.amount !== "0" && formValues.token && !balanceInsufficient
  }

  const canProceedToStep3 = () => {
    return true // Image upload is optional
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onUploadChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY
    if (!apiKey) {
      setUploadError("Lighthouse API key not configured")
      return
    }
    setUploading(true)
    setUploadError(null)
    setUploadProgress(0)
    try {
      const { default: lighthouse } = await import("@lighthouse-web3/sdk")
      const progressCallback = (progressData: any) => {
        try {
          const pct =
            100 -
            Number(
              (
                (progressData?.total / progressData?.uploaded) as number
              ).toFixed(2)
            )
          if (!Number.isNaN(pct)) setUploadProgress(pct)
        } catch { }
      }
      const output = await lighthouse.upload(
        files,
        apiKey,
        undefined,
        progressCallback
      )
      const cid = output?.data?.Hash as string | undefined
      if (!cid) throw new Error("Upload failed: no CID returned")
        ; (formValuesRef as any).trigger.updateImageCid({ value: cid })
      setUploadProgress(100)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  // Step 1: Select currency and enter amount
  const renderStep1 = () => (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4">
        <h3 className="text-5xl font-bold text-sky-600 -mt-44">SET GIFT VALUE</h3>
        <TokenAmountInputCard
          variant="2"
          labelSlot={
            <label
              htmlFor="gift-amount-in"
              className="font-bold text-label text-sm"
            >
              Gift amount
            </label>
          }
          inputSlot={
            <TokenAmountInputCard.Input
              id="gift-amount-in"
              name="amount"
              value={formValues.amount}
              onChange={(e) =>
                (formValuesRef as any).trigger.updateAmount({
                  value: e.target.value,
                })
              }
              disabled={processing}
            />
          }
          tokenSlot={
            <SelectAssets
              selected={formValues.token ?? undefined}
              handleSelect={() =>
                openModalSelectAssets("token", formValues.token)
              }
            />
          }
          balanceSlot={
            <BlockMultiBalances
              balance={balanceAmount}
              decimals={tokenBalance?.decimals ?? 0}
              className={clsx(
                "!static",
                tokenBalance == null && "invisible"
              )}
              maxButtonSlot={
                <BlockMultiBalances.DisplayMaxButton
                  onClick={handleSetMaxValue}
                  balance={balanceAmount}
                  disabled={disabled}
                />
              }
              halfButtonSlot={
                <BlockMultiBalances.DisplayHalfButton
                  onClick={handleSetHalfValue}
                  balance={balanceAmount}
                  disabled={disabled}
                />
              }
            />
          }
          priceSlot={
            <TokenAmountInputCard.DisplayPrice>
              {usdAmount !== null && usdAmount > 0
                ? formatUsdAmount(usdAmount)
                : null}
            </TokenAmountInputCard.DisplayPrice>
          }
        />
      </div>

    </div>
  )

  // Step 2: Upload image
  const renderStep2 = () => (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4">
        <h3 className="text-5xl font-bold text-sky-600 -mt-44">Attach Memory</h3>
        <div className="w-full">


          {/* Show upload area only if no image is uploaded */}
          {!formValues.imageCid && (
            <div className="max-w-md mx-auto rounded-lg overflow-hidden">
              <div className="w-full p-3">
                <div className="relative h-48 rounded-lg border-2 border-sky-400 bg-gray-50 flex justify-center items-center shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                  <div className="absolute flex flex-col items-center">
                    <svg className="w-16 h-16 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="block text-gray-500 font-semibold">
                      Drag & drop your files here
                    </span>
                    <span className="block text-gray-400 font-normal mt-1">
                      or click to upload
                    </span>
                  </div>

                  <input
                    id="gift-image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onUploadChange(e.target.files)}
                    disabled={processing || uploading}
                    className="h-full w-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {uploading && (
            <div className="text-xs text-gray-600 mt-2">
              Uploading… {uploadProgress != null ? `${uploadProgress}%` : ""}
            </div>
          )}
          {uploadError && (
            <div className="text-xs text-red-600 mt-2">{uploadError}</div>
          )}

          {/* Show uploaded image */}
          {formValues.imageCid && (
            <div className="max-w-md mx-auto">
              <div className="relative">
                <a
                  href={`https://gateway.lighthouse.storage/ipfs/${formValues.imageCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`https://gateway.lighthouse.storage/ipfs/${formValues.imageCid}`}
                    alt="Gift memory preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-sky-400 shadow-lg"
                  />
                </a>
                {/* Remove image button */}
                <button
                  onClick={() => {
                    (formValuesRef as any).trigger.updateImageCid({ value: "" })
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )

  // Step 3: Create gift link and share
  const renderStep3 = () => (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4">
        <h3 className="text-5xl font-bold text-sky-600 -mt-44">Wrap Gift</h3>
        <div className="text-center text-sm text-gray-600">
          Review your gift details and create the shareable link
        </div>

        {/* Gift Summary */}
        <div className="w-full border border-gray-200 rounded-lg p-4">
          <div className="text-sm">
            <div className="flex justify-between mb-2">
              <span>AMOUNT:</span>
              <span className="font-medium">{formValues.amount} {formValues.token?.symbol}</span>
            </div>
          </div>
        </div>
      </div>

      {processingLabel && (
        <div className="text-xs text-gray-600 text-center">{processingLabel}</div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col">
      {(rootSnapshot as any).matches("settled") &&
        readyGiftRef != null &&
        signerCredentials != null && (
          <GiftMakerReadyDialog
            readyGiftRef={readyGiftRef}
            generateLink={generateLink}
            signerCredentials={signerCredentials}
          />
        )}

      {/* Clean container without background */}
      <div className="w-full max-w-md flex flex-col items-start gap-6 p-6 flex-1">
        {/* Render current step */}
        <div className="w-full pt-52 ml-0 flex justify-center text-center items-center flex-col flex-1 min-h-screen">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>

      {/* Fixed navigation buttons at bottom */}
      <div className="fixed bottom-6 left-[67%] transform -translate-x-1/2 w-full max-w-md px-6">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <span className="text-2xl font-bold">BACK</span>
            </button>
          )}
          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-400 text-white hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              disabled={currentStep === 1 ? !canProceedToStep2() : !canProceedToStep3()}
            >
              <span className="text-2xl font-bold">NEXT</span>
            </button>
          ) : (
            <AuthGate
              renderHostAppLink={renderHostAppLink}
              shouldRender={isLoggedIn}
            >
              <button
                onClick={() => {
                  if (signerCredentials != null) {
                    rootActorRef.send({
                      type: "REQUEST_SIGN",
                      signMessage,
                      signerCredentials,
                    })
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-400 text-white hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                disabled={balanceInsufficient || processing}
              >
                <span className="text-2xl font-bold">{processing ? "WRAPPING" : "CREATE GIFT"}</span>
              </button>
            </AuthGate>
          )}
        </div>
      </div>

      {error != null && (
        <div className="mt-2">
          <ErrorReason reason={error.reason} />
        </div>
      )}
    </div>
  )
}
