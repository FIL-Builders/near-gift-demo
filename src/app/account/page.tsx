import { redirect } from "next/navigation"

export default function AccountRedirect() {
  redirect("/gift-card/create-gift")
}

