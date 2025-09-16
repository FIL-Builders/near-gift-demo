"use client"

import { Button, Popover, Text } from "@radix-ui/themes"
import Image from "next/image"
import { useContext, useEffect, useState } from "react"

import WalletConnections from "@src/components/Wallet/WalletConnections"
import { isSupportedByBrowser } from "@src/features/webauthn/lib/webauthnService"
import { ChainType, useConnectWallet } from "@src/hooks/useConnectWallet"
import useShortAccountId from "@src/hooks/useShortAccountId"
import { FeatureFlagsContext } from "@src/providers/FeatureFlagsProvider"
import { useSignInWindowOpenState } from "@src/stores/useSignInWindowOpenState"
import { mapStringToEmojis } from "@src/utils/emoji"
// Learning edition: only Near and Passkey

const ConnectWallet = () => {
  // Avoid hydration mismatch by rendering after mount
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { isOpen, setIsOpen } = useSignInWindowOpenState()
  const { state, signIn } = useConnectWallet()
  const { shortAccountId } = useShortAccountId(state.displayAddress ?? "")
  // keep context ready if needed later; not used now
  useContext(FeatureFlagsContext)

  const handleNearWalletSelector = () => {
    return signIn({ id: ChainType.Near })
  }

  const handlePasskey = () => signIn({ id: ChainType.WebAuthn })
  // Single Ethereum Wallet entry; hook decides best connector
  const handleEthereum = () => signIn({ id: ChainType.EVM })

  if (!mounted) return null
  if (!state.address) {
    return (
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger>
          <Button type={"button"} variant={"solid"} size={"2"} radius={"full"}>
            <Text weight="bold" wrap="nowrap">
              Sign in
            </Text>
          </Button>
        </Popover.Trigger>
        <Popover.Content
          maxWidth={{ initial: "90vw", xs: "480px" }}
          minWidth={{ initial: "300px", xs: "330px" }}
          maxHeight="90vh"
          className="md:mr-[48px] dark:bg-black-800 rounded-2xl"
        >
          <Text size="1">How do you want to sign in?</Text>
          <div className="w-full grid grid-cols-1 gap-4 mt-4">
            <Text size="1" color="gray">
              Popular options
            </Text>

            {isSupportedByBrowser() && (
              <Button
                onClick={() => handlePasskey()}
                size="4"
                radius="medium"
                variant="soft"
                color="gray"
                className="px-2.5"
              >
                <div className="w-full flex items-center justify-start gap-2">
                  <Image
                    src="/static/icons/wallets/webauthn.svg"
                    alt=""
                    width={36}
                    height={36}
                  />
                  <Text size="2" weight="bold">
                    Passkey
                  </Text>
                </div>
              </Button>
            )}

            <Button
              onClick={handleEthereum}
              size="4"
              radius="medium"
              variant="soft"
              color="gray"
              className="px-2.5"
            >
              <div className="w-full flex items-center justify-start gap-2">
                <Image
                  src="/static/icons/wallets/meta-mask.svg"
                  alt="Ethereum Wallet"
                  width={36}
                  height={36}
                />
                <Text size="2" weight="bold">
                  Ethereum Wallet
                </Text>
              </div>
            </Button>

            <Button
              onClick={handleNearWalletSelector}
              size="4"
              radius="medium"
              variant="soft"
              color="gray"
              className="px-2.5"
            >
              <div className="w-full flex items-center justify-start gap-2">
                <Image
                  src="/static/icons/wallets/near-wallet-selector.svg"
                  alt="Near Wallet Selector"
                  width={36}
                  height={36}
                />
                <Text size="2" weight="bold">
                  NEAR Wallet
                </Text>
              </div>
            </Button>
          </div>
        </Popover.Content>
      </Popover.Root>
    )
  }

  return (
    <div className="flex gap-2">
      <Popover.Root>
        <Popover.Trigger>
          <Button
            type={"button"}
            variant={"soft"}
            color={"gray"}
            size={"2"}
            radius={"full"}
            className="font-bold text-gray-12"
          >
            {state.chainType !== "webauthn" ? (
              shortAccountId
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex">
                  <Image
                    src="/static/icons/wallets/webauthn.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="rounded-full size-6 bg-[#000]"
                    style={{
                      mask: "radial-gradient(13px at 31px 50%, transparent 99%, rgb(255, 255, 255) 100%)",
                    }}
                  />
                  <div className="-ml-1 rounded-full size-6 bg-white text-black text-base flex items-center justify-center">
                    {mapStringToEmojis(state.address, { count: 1 }).join("")}
                  </div>
                </div>

                <div className="font-bold text-gray-12">passkey</div>
              </div>
            )}
          </Button>
        </Popover.Trigger>
        <Popover.Content
          minWidth={{ initial: "300px", xs: "330px" }}
          className="mt-1 md:mr-[48px] max-w-xs dark:bg-black-800 rounded-2xl"
        >
          <div className="flex flex-col gap-5">
            <WalletConnections />
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}

// EVM connectors removed in learning edition

export default ConnectWallet
