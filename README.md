**Near Gift Demo** is a didactic, minimal Next.js app which showcases an end‑to‑end “gift card” flow on Near Intents and related chains. It is intentionally small, pragmatic, and annotated to help you learn how pieces fit together.

This repo has been simplified for clarity:
- Uses the published `@defuse-protocol/intents-sdk` and `@defuse-protocol/internal-utils` packages where appropriate
- Removes non‑essential features (swap/deposit/withdraw UIs, price feeds, holdings, Sentry, Biome, Bun, Nix)
- Keeps only a clean gift experience (create + view/claim) with a small, explicit state model

The two primary user flows are available under the app router:
- Create Gift: `src/app/gift-card/create-gift/page.tsx:1`
- View/Claim Gift: `src/app/gift-card/view-gift/page.tsx:1`


**Quickstart**

- Prerequisites: Node 18+ or 20+, Yarn or npm
- Install deps: `yarn install` or `npm install --legacy-peer-deps`
- Dev: `yarn dev` then open http://localhost:3000
- Build: `yarn build`
- Start (prod): `yarn start`


**Environment**

Create `.env` based on your setup. For a minimal demo you’ll most likely want:
- App config
  - `NEXT_PUBLIC_APP_ENV=development` or `production`
  - `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
  - `NEXT_PUBLIC_INTENTS_ENV=production` or `stage` (selects Near Intents endpoints)
- Supabase (for persisting gifts and WebAuthn credentials)
  - `SUPABASE_URL=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...`

Optional (instrumentation, analytics) variables exist elsewhere in the repo; they are not required for a local run.


**Database (Supabase)**

This app stores gift links and WebAuthn credentials in Supabase. To create the tables:
- Ensure `.env` has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (service role key is used server‑side)
- Generate the SQL you’ll run in Supabase:
  - `yarn db:setup:js`
- In the Supabase Dashboard → SQL Editor, run the printed statements to create:
  - `public.gifts`
  - `public.webauthn_credentials`

You can reprint the SQL via `yarn db:setup:js` (source in `scripts/setup-db.sql:1`).


**Architecture Overview**

- Framework: Next.js App Router + React 19 (no pages router)
- State: XState for gift flows; light React context for modal state
- Networking: fetch (Next API routes + Supabase SDK)
- Wallet + Signatures: wallet-agnostic sign/verify helpers; NEP‑413 support; optional WebAuthn path
- Styling: Tailwind + Radix UI components (small surface)


**Key Directories**

- App entry and routes
  - `src/app/layout.tsx:1` – root HTML, global providers and theme
  - `src/app/page.tsx:1` – landing page that links to create-gift
  - `src/app/gift-card/create-gift/page.tsx:1` – Create Gift UI
  - `src/app/gift-card/view-gift/page.tsx:1` – View/Claim Gift UI
  - API routes for gift persistence and helpers:
    - `src/app/api/gifts/route.ts:1` (POST create)
    - `src/app/api/gifts/[giftId]/route.ts:1` (GET by id)

- Gift feature (didactic core)
  - UI components
    - `src/components/DefuseSDK/features/gift/components/GiftMakerWidget.tsx:1`
    - `src/components/DefuseSDK/features/gift/components/GiftTakerWidget.tsx:1`
    - `src/components/DefuseSDK/features/gift/components/GiftHistoryWidget.tsx:1`
  - XState machines (user flow orchestration)
    - `src/components/DefuseSDK/features/gift/actors/giftMakerRootMachine.ts:1`
    - `src/components/DefuseSDK/features/gift/actors/giftMakerSignActor.ts:1`
    - `src/components/DefuseSDK/features/gift/actors/shared/giftClaimActor.ts:1`
    - `src/components/DefuseSDK/features/machines/signIntentMachine.ts:1` – reusable signer/verify flow
    - `src/components/DefuseSDK/features/machines/publicKeyVerifierMachine.ts:1` – assist NEP‑413 pubkey
  - Gift link utilities
    - `src/app/gift-card/_utils/encoder.ts:1` – base64url encode/decode, AES‑GCM encrypt/decrypt
    - `src/app/gift-card/_utils/link.ts:1` – construct shareable link, fetch/save gift payload via API

- Shared building blocks
  - Modals & state
    - `src/components/DefuseSDK/providers/ModalStoreProvider.tsx:1` – minimal modal context
    - `src/components/DefuseSDK/components/Modal/ModalContainer.tsx:1` – renders active modal
    - `src/components/DefuseSDK/components/Modal/ModalSelectAssets.tsx:1` – pick a token from provided list
    - `src/components/DefuseSDK/components/Modal/ModalConfirmAddPubkey.tsx:1`
  - UI primitives (a few)
    - `src/components/DefuseSDK/components/Asset/AssetList.tsx:1`
    - `src/components/DefuseSDK/components/Block/BlockMultiBalances/index.tsx:1`
    - `src/components/DefuseSDK/components/Button/ButtonCustom.tsx:1`
    - `src/components/DefuseSDK/components/Popover.tsx:1`, `SelectAssets.tsx:1`, `Island.tsx:1`
  - Utilities
    - `src/components/DefuseSDK/utils/assert.ts:1`, `token.ts:1`, `tokenUtils.ts:1`, `format.ts:1`
    - `src/components/DefuseSDK/utils/verifyWalletSignature.ts:1`, `webAuthn.ts:1`, `near.ts:1`

- SDK configuration
  - `src/components/DefuseSDK/config.ts:1` – environment endpoints for production/stage
  - `src/libs/defuse-sdk/initSDK.ts:1` – sets SDK env + logger + features on boot

- App‑wide utilities/providers
  - `src/app/ClientProviders.tsx:1` – wraps app with query client, wallet providers, feature flags
  - `src/utils/environment.ts:1` – typed env variables
  - `src/utils/logger.ts:1` – app logging façade


**Flow: Create Gift**

- UI: `GiftMakerWidget` → `GiftMakerForm` guides user to select a token + amount and compose a message/image
- Sign: `giftMakerRootMachine` launches `giftMakerSignActor` → `signIntentMachine`
  - Builds a wallet message (NEP‑413 for Near, ERC‑191 for EVM, etc.)
  - Prompts the user to sign with the connected wallet
  - Verifies signature locally (`verifyWalletSignature.ts:1`)
  - For NEP‑413 accounts, if a public key is missing on the Near Intents contract, prompts to add it (`publicKeyVerifierMachine.ts:1`)
- Persist gift: client encrypts payload (AES‑GCM) and requests server save via API `POST /api/gifts`
- Share: constructs a link `/gift-card/view-gift#<encoded-payload>` to send to a friend


**Flow: View / Claim Gift**

- UI: `GiftTakerWidget` reads the URL hash, decodes the payload, and shows claim UI
- Sign: the taker signs a message to claim
- Publish: the flow publishes to the solver relay and optionally waits for settlement


**State & Modals**

- We keep state explicit and local:
  - XState drives long‑lived flows (sign, claim, settlement)
  - A tiny React context manages modals (type + payload)
  - The asset selector receives `tokenList` directly via the modal payload


**Supabase: API Contracts**

- `POST /api/gifts` (`src/app/api/gifts/route.ts:1`): stores gift payload `{ gift_id, encrypted_payload, p_key, image_cid }`
- `GET /api/gifts/[giftId]` (`src/app/api/gifts/[giftId]/route.ts:1`): fetch stored gift data by id

Both routes use `src/libs/supabase.ts:1` and `src/libs/supabaseServer.ts:1` under the hood.


**Wallets & Signatures**

- The signer flow supports multiple signature types and local verification:
  - Near (NEP‑413), EVM (EIP‑191), Solana (ed25519), WebAuthn, Stellar formats
- See `src/components/DefuseSDK/utils/verifyWalletSignature.ts:1` and `webAuthn.ts:1` for the algorithms


**Extending the Demo**

- Show USD values: re‑introduce a simple price feed and wire it into `GiftMakerForm`
- Balance sources: keep or remove the balance machine depending on your learning goals
- Analytics: hook your analytics system inside `src/utils/logger.ts:1`
- Error boundaries: consider adding app‑level error boundaries for better UX


**Common Commands**

- `yarn dev` – start the dev server
- `yarn build` – build for production
- `yarn start` – run the production server
- `yarn db:setup:js` – print SQL to create Supabase tables


**Troubleshooting**

- “No space left on device”: clean `.next/` and retry build, or ensure disk space is available
- “Module not found” after pruning: run `yarn install` to update the lockfile and rebuild
- Supabase 401/404: verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`


Happy hacking! This repo aims to be a clear starting point—opt into more sophistication as you learn.
