"use client"
import { WidgetRoot } from "../../../components/WidgetRoot"
import { SwapWidgetProvider } from "../../../providers/SwapWidgetProvider"

import { GiftMakerForm } from "./GiftMakerForm"
import type { GiftMakerWidgetProps } from "./GiftMakerForm"

export function GiftMakerWidget(props: GiftMakerWidgetProps) {
  return (
    <WidgetRoot>
      <SwapWidgetProvider>
        <div className="w-1/2 h-full rounded-2xl p-5">
          <GiftMakerForm {...props} />
        </div>
      </SwapWidgetProvider>
    </WidgetRoot>
  )
}
