"use client"

import Link from "next/link"
import { type PropsWithChildren } from "react"

export default function Paper({ children }: PropsWithChildren) {

  return (
    <div className="flex flex-col flex-1 justify-start items-center mt-5 md:mt-14 min-w-0">
      <div className="w-full px-3">
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  )
}
