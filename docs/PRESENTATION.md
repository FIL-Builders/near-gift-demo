# Near Gift Demo — Developer Workshop (Draft)

> A didactic, hands‑on introduction to the NEAR ecosystem, building blocks, and an in‑depth tour of this minimal Gift Card demo. By the end, you’ll understand how to extend the demo or bootstrap your own NEAR‑powered app.

---

## Learning Goals

- Understand NEAR fundamentals: accounts, keys, transactions, standards
- Learn modern developer tooling and workflows for NEAR apps
- Deep dive into the Gift Demo architecture and flows
- Practice extending the demo and shipping features safely
- Get a repeatable blueprint to start your own app

---

## Agenda (Suggested)

1) NEAR Ecosystem Overview (15 min)
2) Developer Tooling & Standards (15 min)
3) Project Deep Dive: Gift Demo (45 min)
4) Labs: Extend the Demo (45 min)
5) Production Readiness & Next Steps (15 min)
6) Q&A (15 min)

Total: ~2.5 hours (adjust to audience)

---

## 1) NEAR Ecosystem Overview

NEAR is a high‑performance, developer‑friendly L1 with the following design choices:

- Human‑readable Accounts: `alice.near` instead of raw hex
- Flexible Keys: per‑app access keys and granular permissions
- Predictable Costs: fast finality; fees designed for UX
- Standards: NEP series (e.g., NEP‑141 for fungible tokens, NEP‑171 NFTs, NEP‑413 signed messages)
- Bridges & Compatibility: Aurora EVM for EVM tooling; integrations with other ecosystems

Key concepts you’ll use in this demo:

- Accounts & Access Keys: Wallets can add/remove access keys to authorize actions
- Contracts & Methods: WASM contracts (Rust/AssemblyScript) expose view & change methods
- JSON‑RPC: Interact with contracts, blocks, and transactions via RPC endpoints
- NEP‑413: A standard for wallet‑agnostic message signatures used for identity/intent flows

Recommended reading:
- NEAR Docs: https://docs.near.org/
- NEP‑standards: https://github.com/near/NEPs

---

## 2) Developer Tooling & Standards

Core tools & libraries:

- near-api-js (legacy)/@near-js/* (modern split): low‑level RPC & helpers
- Wallets: MyNearWallet, hardware solutions; dApp connectors abstract key management
- NEP Standards:
  - NEP‑141 (FT), NEP‑171 (NFT), NEP‑177 (Storage Deposit), NEP‑413 (Signatures)
- Intents & Relays:
  - This demo integrates with the Defuse Intents stack to publish signed “intents” via a relay and wait for settlement

Workflows:
- Local dev on testnet or staging endpoints
- Use typed env vars (see `src/utils/environment.ts:1`)
- API routes in Next.js for server logic and secrets (e.g., Supabase)

---

## 3) Project Deep Dive — Gift Demo

High‑level goals:
- Minimal, readable code
- Clear boundaries between UI, state machines, and persistence
- Wallet‑agnostic signing and local verification

### 3.1 Top‑Level Structure

- App routes
  - Landing: `src/app/page.tsx:1`
  - Create Gift: `src/app/gift-card/create-gift/page.tsx:1`
  - View/Claim Gift: `src/app/gift-card/view-gift/page.tsx:1`
  - API (server):
    - `POST /api/gifts`: `src/app/api/gifts/route.ts:1`
    - `GET /api/gifts/[giftId]`: `src/app/api/gifts/[giftId]/route.ts:1`

- Gift UI & State
  - Maker widget: `src/components/DefuseSDK/features/gift/components/GiftMakerWidget.tsx:1`
  - Maker form: `src/components/DefuseSDK/features/gift/components/GiftMakerForm.tsx:1`
  - Taker widget: `src/components/DefuseSDK/features/gift/components/GiftTakerWidget.tsx:1`
  - Gift history (local storage): `src/components/DefuseSDK/features/gift/components/GiftHistoryWidget.tsx:1`

- State machines (XState)
  - Maker root: `src/components/DefuseSDK/features/gift/actors/giftMakerRootMachine.ts:1`
  - Maker sign: `src/components/DefuseSDK/features/gift/actors/giftMakerSignActor.ts:1`
  - Claim: `src/components/DefuseSDK/features/gift/actors/shared/giftClaimActor.ts:1`
  - Shared signer: `src/components/DefuseSDK/features/machines/signIntentMachine.ts:1`
  - Public key verifier: `src/components/DefuseSDK/features/machines/publicKeyVerifierMachine.ts:1`

- Utilities (selected)
  - Verify signatures: `src/components/DefuseSDK/utils/verifyWalletSignature.ts:1`
  - WebAuthn helpers: `src/components/DefuseSDK/utils/webAuthn.ts:1`
  - Token math: `src/components/DefuseSDK/utils/tokenUtils.ts:1`, `format.ts:1`
  - Near helpers (RPC, decoding): `src/components/DefuseSDK/utils/near.ts:1`

- Modals
  - Provider: `src/components/DefuseSDK/providers/ModalStoreProvider.tsx:1`
  - Container: `src/components/DefuseSDK/components/Modal/ModalContainer.tsx:1`
  - Asset selector: `src/components/DefuseSDK/components/Modal/ModalSelectAssets.tsx:1`

- SDK configuration
  - Env & endpoints: `src/components/DefuseSDK/config.ts:1`
  - Runtime setup: `src/libs/defuse-sdk/initSDK.ts:1`

### 3.2 Data Flow (Create Gift)

1) User selects token, amount, and (optionally) attaches an image
2) Form triggers `giftMakerRootMachine` to start a sign flow
3) `giftMakerSignActor` builds a wallet message (NEP‑413 for NEAR, etc.), prompts the wallet
4) `signIntentMachine` verifies the signature locally; NEP‑413 path can prompt to add a public key on contract
5) Client encrypts gift payload (AES‑GCM) and calls `POST /api/gifts` to persist
6) UI renders a share link that encodes data in the URL hash (safer to share)

### 3.3 Data Flow (View/Claim Gift)

1) `GiftTakerWidget` parses the URL hash and optionally fetches persisted data
2) Decrypts gift payload locally (if encrypted)
3) Runs `giftClaimActor` to sign and publish the claim intent
4) Optionally waits for settlement/receipt, then shows success

### 3.4 Security Notes

- All payloads are encrypted client‑side before persistence
- Signatures are always verified locally before proceeding
- URL hash storage means most sharing flows don’t leak the payload to servers
- API routes are the only place secrets (like Supabase service key) are used

---

## 4) Labs — Extend the Demo

Pick any of the following to practice:

### Lab A — USD Prices (Intermediate)
- Add a simple price feed function `getUsdValue(tokenId)` (Coingecko or mock)
- Surface USD values in `GiftMakerForm` and asset selection

### Lab B — Balance Polling (Intermediate)
- Replace the query‑observer in `depositedBalanceMachine` with a minimal polling loop using `getDepositedBalances`
- Show a live “Your balance” row under the token selector

### Lab C — Custom Modal (Beginner)
- Replace `ModalDialog` with your favorite modal library, keeping `ModalStoreProvider` API intact

### Lab D — Additional Wallets (Advanced)
- Add a new wallet signer path to `signIntentMachine` and `verifyWalletSignature`
- Demonstrate signatures for that wallet’s scheme

### Lab E — Gift Analytics (Intermediate)
- Hook your analytics tool into `src/utils/logger.ts:1` to emit key events

---

## 5) Production Readiness

- Error boundaries and user‑friendly fallbacks (network, wallet, decryption)
- Persistence/data retention and privacy (client‑side encryption is a good default)
- Logging/observability (server logs + client breadcrumbs)
- Monitoring relay capacity and rate limits (if publishing intents)
- Wallet UX: guiding users to add public keys (NEP‑413) only when needed

---

## 6) Start Your Own App — Blueprint

1) Scaffold Next.js App Router project
2) Add typed env (`src/utils/environment.ts:1`)
3) Pick your state model (XState for complex flows; React state otherwise)
4) Decide persistence (Supabase, KV, etc.)
5) Implement wallet‑agnostic sign/verify (`verifyWalletSignature.ts:1` as a template)
6) Keep UI small and explicit; modals via a tiny context
7) Add one end‑to‑end feature (like gifts) before generalizing

**Tip**: Keep directories by “feature” rather than “type” when flows grow (this demo shows both styles, but gift/ is feature‑centric).

---

## 7) References & Resources

- NEAR docs: https://docs.near.org/
- NEP standards: https://github.com/near/NEPs
- XState: https://xstate.js.org/
- Next.js App Router: https://nextjs.org/docs/app
- Supabase: https://supabase.com/docs
- Intents SDK: https://www.npmjs.com/package/@defuse-protocol/intents-sdk

---

## 8) Appendix — Diagrams

Include state diagrams (Mermaid) for `signIntentMachine` and `giftClaimActor` if helpful for your audience.

***

This workshop is intentionally didactic; prefer clarity over cleverness. Fork and tailor it to your team’s needs.

