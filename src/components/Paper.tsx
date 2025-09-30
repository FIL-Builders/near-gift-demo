"use client";
import { type PropsWithChildren } from "react";

export default function Paper({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col flex-1 justify-start items-center  min-w-0 bg-[url('/static/images/landing.svg')] bg-cover bg-center">
      <div className="w-full px-3 mt-5 md:mt-14">
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
}
