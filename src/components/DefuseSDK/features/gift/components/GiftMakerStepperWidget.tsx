"use client";
import type { authHandle } from "@defuse-protocol/internal-utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { useActorRef, useSelector } from "@xstate/react";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ActorRefFrom, PromiseActorLogic } from "xstate";
import { AuthGate } from "../../../components/AuthGate";
import { BlockMultiBalances } from "../../../components/Block/BlockMultiBalances";
import { ButtonCustom } from "../../../components/Button/ButtonCustom";
import type { ModalSelectAssetsPayload } from "../../../components/Modal/ModalSelectAssets";
import { SelectAssets } from "../../../components/SelectAssets";
import { WidgetRoot } from "../../../components/WidgetRoot";
import type { SignerCredentials } from "../../../core/formatters";
import {
  useModalStore,
  ModalType,
} from "../../../providers/ModalStoreProvider";
import { SwapWidgetProvider } from "../../../providers/SwapWidgetProvider";
import type { BaseTokenInfo, UnifiedTokenInfo } from "../../../types/base";
import type { RenderHostAppLink } from "../../../types/hostAppLink";
import type { SwappableToken } from "../../../types/swap";
import { assert } from "../../../utils/assert";
import { cn } from "../../../utils/cn";
import { formatTokenValue, formatUsdAmount } from "../../../utils/format";
import { TokenAmountInputCard } from "../../deposit/components/DepositForm/TokenAmountInputCard";
import { balanceAllSelector } from "../../machines/depositedBalanceMachine";
import type { SendNearTransaction } from "../../machines/publicKeyVerifierMachine";
import type { publicKeyVerifierMachine } from "../../machines/publicKeyVerifierMachine";
import { formValuesSelector } from "../actors/giftMakerFormMachine";
import type { giftMakerReadyActor } from "../actors/giftMakerReadyActor";
import { giftMakerRootMachine } from "../actors/giftMakerRootMachine";
import type { giftMakerSignActor } from "../actors/giftMakerSignActor";
import type {
  GiftMakerSignActorInput,
  GiftMakerSignActorOutput,
} from "../actors/giftMakerSignActor";
import { useBalanceUpdaterSyncWithHistory } from "../hooks/useBalanceUpdaterSyncWithHistory";
import { useCheckSignerCredentials } from "../hooks/useCheckSignerCredentials";
import type {
  CreateGiftIntent,
  GenerateLink,
  SignMessage,
} from "../types/sharedTypes";
import { checkInsufficientBalance, getButtonText } from "../utils/makerForm";
import { FileUploadButton } from "./FileUploadButton";
import { GiftMakerReadyDialog } from "./GiftMakerReadyDialog";
import { GiftMessageInput } from "./GiftMessageInput";
import { ErrorReason } from "./shared/ErrorReason";

export type GiftMakerWidgetProps = {
  /** List of available tokens for trading */
  tokenList: (BaseTokenInfo | UnifiedTokenInfo)[];

  /** User's wallet address */
  userAddress: authHandle.AuthHandle["identifier"] | undefined;
  chainType: authHandle.AuthHandle["method"] | undefined;

  /** Initial tokens for pre-filling the form */
  initialToken?: BaseTokenInfo | UnifiedTokenInfo;

  /** Sign message callback */
  signMessage: SignMessage;

  /** Send NEAR transaction callback */
  sendNearTransaction: SendNearTransaction;

  /** Create Gift in the database */
  createGiftIntent: CreateGiftIntent;

  /** Function to generate a shareable trade link */
  generateLink: GenerateLink;

  /** Theme selection */
  theme?: "dark" | "light";

  /** Frontend referral */
  referral?: string;

  renderHostAppLink: RenderHostAppLink;
};

interface Step {
  id: string;
  title: string;
  description: string;
}

const MAX_MESSAGE_LENGTH = 500;

export function GiftMakerStepperWidget(props: GiftMakerWidgetProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const submitHandlerRef = useRef<(() => void) | null>(null);
  const [submitState, setSubmitState] = useState<{
    processing: boolean;
    balanceInsufficient: boolean;
    editing: boolean;
    processingLabel: string | null;
    isLoggedIn: boolean;
  }>({
    processing: false,
    balanceInsufficient: false,
    editing: false,
    processingLabel: null,
    isLoggedIn: false,
  });

  const steps: Step[] = [
    {
      id: "amount",
      title: "Choose Gift Amount",
      description:
        "Select the token and amount you want to gift to your friend",
    },
    {
      id: "message",
      title: "Add Personal Touch",
      description:
        "Write a personal message and optionally attach a memory photo",
    },
    {
      id: "review",
      title: "Review & Send",
      description: "Review your gift details and send it to your friend",
    },
  ];

  const canGoNext = currentStep < steps.length - 1;
  const canGoPrev = currentStep > 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitHandlerRef.current) {
      submitHandlerRef.current();
    }
  };

  return (
    <WidgetRoot>
      <SwapWidgetProvider>
        <div className="widget-container rounded-2xl bg-gray-1 p-6 shadow">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-start justify-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300",
                        index < currentStep
                          ? "bg-green-600 border-green-600 text-white"
                          : index === currentStep
                            ? "bg-black border-black text-white"
                            : "bg-black bg-opacity-20 border-black border-opacity-30 text-black text-opacity-50"
                      )}
                    >
                      {index < currentStep ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : (
                        <span
                          className={cn(
                            index === currentStep
                              ? "text-white"
                              : "text-black text-opacity-50"
                          )}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-center max-w-24">
                      <div
                        className={cn(
                          "text-xs font-medium transition-all duration-300",
                          index < currentStep
                            ? "text-green-700"
                            : index === currentStep
                              ? "text-black"
                              : "text-black text-opacity-50"
                        )}
                      >
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex items-center h-10 px-2">
                      <div
                        className={cn(
                          "w-20 h-0.5 transition-all duration-500",
                          index < currentStep
                            ? "bg-green-600"
                            : "bg-black bg-opacity-20"
                        )}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-12 mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm text-gray-11">
                {steps[currentStep].description}
              </p>
            </div>

            <div className="h-[240px] flex flex-col">
              <GiftMakerStepperContent
                {...props}
                currentStep={currentStep}
                onNext={handleNext}
                onPrev={handlePrev}
                canGoNext={canGoNext}
                canGoPrev={canGoPrev}
                isLastStep={isLastStep}
                submitHandlerRef={submitHandlerRef}
                setSubmitState={setSubmitState}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="relative flex justify-between pt-6 border-t border-gray-6">
            <div>
              {canGoPrev && (
                <ButtonCustom
                  variant="secondary"
                  onClick={handlePrev}
                  className="flex items-center gap-2"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </ButtonCustom>
              )}
            </div>

            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-gray-9 pt-6">
              Step {currentStep + 1} of {steps.length}
            </div>

            <div>
              {isLastStep ? (
                <form onSubmit={handleSubmit}>
                  <AuthGate
                    renderHostAppLink={props.renderHostAppLink}
                    shouldRender={submitState.isLoggedIn}
                  >
                    <ButtonCustom
                      type="submit"
                      size="base"
                      variant={submitState.processing ? "secondary" : "primary"}
                      isLoading={submitState.processing}
                      disabled={submitState.balanceInsufficient || submitState.processing}
                      className="flex items-center p-5"
                    >
                      {getButtonText(submitState.balanceInsufficient, submitState.editing, submitState.processing)}
                    </ButtonCustom>
                  </AuthGate>
                </form>
              ) : (
                canGoNext && (
                  <ButtonCustom
                    variant="primary"
                    onClick={handleNext}
                    className="flex items-center gap-2"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </ButtonCustom>
                )
              )}
            </div>
          </div>
        </div>
      </SwapWidgetProvider>
    </WidgetRoot>
  );
}

// Main form content with integrated state management
function GiftMakerStepperContent({
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
  currentStep,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  isLastStep,
  submitHandlerRef,
  setSubmitState,
}: GiftMakerWidgetProps & {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isLastStep: boolean;
  submitHandlerRef: React.MutableRefObject<(() => void) | null>;
  setSubmitState: React.Dispatch<React.SetStateAction<{
    processing: boolean;
    balanceInsufficient: boolean;
    editing: boolean;
    processingLabel: string | null;
    isLoggedIn: boolean;
  }>>;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const signerCredentials: SignerCredentials | null = useMemo(
    () =>
      userAddress != null && chainType != null
        ? {
            credential: userAddress,
            credentialType: chainType,
          }
        : null,
    [userAddress, chainType]
  );
  const isLoggedIn = signerCredentials != null;

  const initialToken_ = initialToken ?? tokenList[0];
  assert(initialToken_ !== undefined, "Token list must not be empty");

  const rootActorRef = useActorRef(giftMakerRootMachine, {
    input: {
      initialToken: initialToken_,
      tokenList,
      referral,
      createGiftIntent,
    },
  });

  const formRef = useSelector(rootActorRef, (s) => s.context.formRef);
  const formValuesRef = useSelector(formRef, formValuesSelector);
  const formValues = useSelector(formValuesRef, (s) => s.context);

  const { tokenBalance } = useSelector(
    useSelector(rootActorRef, (s) => s.context.depositedBalanceRef),
    balanceAllSelector({
      tokenBalance: formValues.token,
    })
  );

  const rootSnapshot = useSelector(rootActorRef, (s) => s);
  const { readyGiftRef } = useSelector(rootActorRef, (s) => ({
    readyGiftRef: s.children.readyGiftRef as unknown as
      | undefined
      | ActorRefFrom<typeof giftMakerReadyActor>,
  }));

  useCheckSignerCredentials(rootActorRef, signerCredentials);
  useBalanceUpdaterSyncWithHistory(rootActorRef, signerCredentials);

  const usdAmount = null;

  const { setModalType, payload } = useModalStore();

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
    });
  };

  useEffect(() => {
    if (
      (payload as ModalSelectAssetsPayload)?.modalType !==
      ModalType.MODAL_SELECT_ASSETS
    ) {
      return;
    }

    const { modalType, fieldName } = payload as ModalSelectAssetsPayload;
    const _payload = payload as ModalSelectAssetsPayload;
    const token = _payload[fieldName || "token"];
    if (modalType === ModalType.MODAL_SELECT_ASSETS && fieldName && token) {
      (formValuesRef as any).trigger.updateToken({ value: token });
    }
  }, [payload, formValuesRef]);

  const balanceInsufficient = useMemo(() => {
    if (!tokenBalance) {
      return false;
    }
    return checkInsufficientBalance(formValues.amount, tokenBalance);
  }, [formValues.amount, tokenBalance]);

  const editing = (rootSnapshot as any).matches("editing");
  const processing =
    (rootSnapshot as any).matches("signing") ||
    (rootSnapshot as any).matches("saving") ||
    (rootSnapshot as any).matches("publishing") ||
    (rootSnapshot as any).matches("updating") ||
    (rootSnapshot as any).matches("settling") ||
    (rootSnapshot as any).matches("removing");

  const processingLabel = (() => {
    if ((rootSnapshot as any).matches("signing")) return "Signing…";
    if ((rootSnapshot as any).matches("saving")) return "Saving…";
    if ((rootSnapshot as any).matches("publishing")) return "Publishing…";
    if ((rootSnapshot as any).matches("settling"))
      return "Waiting for settlement…";
    if ((rootSnapshot as any).matches("updating")) return "Finalizing…";
    if ((rootSnapshot as any).matches("removing")) return "Cleaning up…";
    return null;
  })();

  const error = rootSnapshot.context.error;

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
                >;
              };
            }
          ).children.signRef;
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
              >;
            };
          }
        ).children.publicKeyVerifierRef;
      }
    }
  );

  const publicKeyVerifierSnapshot = useSelector(
    _publicKeyVerifierRef ?? undefined,
    (s) => s
  );

  useEffect(() => {
    if ((publicKeyVerifierSnapshot as any)?.matches("checked")) {
      _publicKeyVerifierRef?.send({
        type: "ADD_PUBLIC_KEY",
        sendNearTransaction,
      });
    }
  }, [publicKeyVerifierSnapshot, _publicKeyVerifierRef, sendNearTransaction]);

  const handleSetMaxValue = async () => {
    if (tokenBalance != null) {
      (formValuesRef as any).trigger.updateAmount({
        value: formatTokenValue(tokenBalance.amount, tokenBalance.decimals),
      });
    }
  };

  const handleSetHalfValue = async () => {
    if (tokenBalance != null) {
      (formValuesRef as any).trigger.updateAmount({
        value: formatTokenValue(
          tokenBalance.amount / 2n,
          tokenBalance.decimals
        ),
      });
    }
  };

  const balanceAmount = tokenBalance?.amount ?? 0n;
  const disabled = tokenBalance?.amount === 0n;

  const onUploadChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      setUploadError("Lighthouse API key not configured");
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    try {
      const { default: lighthouse } = await import("@lighthouse-web3/sdk");
      const progressCallback = (progressData: any) => {
        try {
          const pct =
            100 -
            Number(
              (
                (progressData?.total / progressData?.uploaded) as number
              ).toFixed(2)
            );
          if (!Number.isNaN(pct)) setUploadProgress(pct);
        } catch {}
      };
      const output = await lighthouse.upload(
        files,
        apiKey,
        undefined,
        progressCallback
      );
      const cid = output?.data?.Hash as string | undefined;
      if (!cid) throw new Error("Upload failed: no CID returned");
      (formValuesRef as any).trigger.updateImageCid({ value: cid });
      setUploadProgress(100);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (signerCredentials != null) {
      rootActorRef.send({
        type: "REQUEST_SIGN",
        signMessage,
        signerCredentials,
      });
    }
  };

  // Set up the submit handler for the main component
  useEffect(() => {
    submitHandlerRef.current = () => {
      if (signerCredentials != null) {
        rootActorRef.send({
          type: "REQUEST_SIGN",
          signMessage,
          signerCredentials,
        });
      }
    };
    return () => {
      submitHandlerRef.current = null;
    };
  }, [signerCredentials, rootActorRef, signMessage]);

  // Update submit state for the main component
  useEffect(() => {
    setSubmitState({
      processing,
      balanceInsufficient,
      editing,
      processingLabel,
      isLoggedIn,
    });
  }, [processing, balanceInsufficient, editing, processingLabel, isLoggedIn]);

  if (currentStep === 0) {
    // Step 1: Amount Selection
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-4">
          {(rootSnapshot as any).matches("settled") &&
            readyGiftRef != null &&
            signerCredentials != null && (
              <GiftMakerReadyDialog
                readyGiftRef={readyGiftRef}
                generateLink={generateLink}
                signerCredentials={signerCredentials}
              />
            )}

          <div className="flex flex-col gap-3">
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
                  className={clsx("!static", tokenBalance == null && "invisible")}
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

          {error != null && (
            <div className="mt-2">
              <ErrorReason reason={error.reason} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 1) {
    // Step 2: Message and Photo
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-4">
          <div className="w-full">
            <GiftMessageInput
              inputSlot={
                <GiftMessageInput.Input
                  id="gift-message"
                  name="message"
                  value={formValues.message}
                  onChange={(e) =>
                    (formValuesRef as any).trigger.updateMessage({
                      value: e.target.value,
                    })
                  }
                  maxLength={MAX_MESSAGE_LENGTH}
                />
              }
              countSlot={
                formValues.message.length > 0 ? (
                  <GiftMessageInput.DisplayCount
                    count={MAX_MESSAGE_LENGTH - formValues.message.length}
                  />
                ) : null
              }
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-12 mb-2">
              Memory Photo (Optional)
            </label>
            <FileUploadButton
              onFileSelect={onUploadChange}
              uploading={uploading}
              uploadProgress={uploadProgress}
              uploadError={uploadError}
              previewUrl={
                formValues.imageCid
                  ? `https://gateway.lighthouse.storage/ipfs/${formValues.imageCid}`
                  : null
              }
              disabled={processing}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    // Step 3: Review and Submit
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-6">
          {/* Gift Summary */}
          <div className="bg-gray-2 border border-gray-6 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-12">Gift Summary</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-11">Token:</span>
                <span className="text-gray-12 font-medium">
                  {formValues.token?.name || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-11">Amount:</span>
                <span className="text-gray-12 font-medium">
                  {formValues.amount || "0"} {formValues.token?.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-11">Message:</span>
                <span className="text-gray-12 font-medium">
                  {formValues.message || "No message"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-11">Photo:</span>
                <span className="text-gray-12 font-medium">
                  {formValues.imageCid ? (
                    <a
                      href={`https://gateway.lighthouse.storage/ipfs/${formValues.imageCid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-9 hover:text-blue-10 underline cursor-pointer transition-colors"
                    >
                      View file
                    </a>
                  ) : (
                    "None"
                  )}
                </span>
              </div>
            </div>
          </div>

          {error != null && (
            <div className="mt-2">
              <ErrorReason reason={error.reason} />
            </div>
          )}
        </div>

      </div>
    );
  }

  return null;
}
