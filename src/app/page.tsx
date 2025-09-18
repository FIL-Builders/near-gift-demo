"use client"
import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[url('/static/images/landing.svg')] bg-cover bg-center">
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 transform">
        <Link
          href="/account"
          className="rounded-md bg-black px-6 py-3 text-white shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Get started
        </Link>
      </div>
    </main>
  )
}
