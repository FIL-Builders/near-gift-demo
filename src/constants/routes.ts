export const navigation = {
  home: "/",
  account: "/account",
  deposit: "/deposit",
  withdraw: "/withdraw",
  gift: "/gift-card/create-gift",
  myGifts: "/gift-card/my-gifts",
  otc: "/otc/create-order",
  jobs: "/jobs",
} satisfies Record<AppRoutes, string>;

export type AppRoutes =
  | "home"
  | "account"
  | "deposit"
  | "withdraw"
  | "gift"
  | "myGifts"
  | "otc"
  | "jobs";
