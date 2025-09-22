"use client"

import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[url('/static/images/giftBg.jpg')] bg-cover bg-center">
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 transform">
        <Link
          href="/account"
          className="rounded-full bg-sky-500 px-8 py-3 text-white shadow hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          Get started
        </Link>
      </div>
    </main>
  )
}
