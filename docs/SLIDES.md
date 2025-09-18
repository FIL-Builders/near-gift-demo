# Near Gift Demo — Slide Deck (Draft)

---

## Title
- Near Gift Demo: Building a Minimal NEAR App
- Goals: Understand NEAR, this demo’s architecture, and how to extend it

---

## NEAR at a Glance
- Human‑readable accounts (e.g., `alice.near`)
- Flexible access keys with granular permissions
- Fast finality, predictable UX
- Standards: NEP‑141 (FT), NEP‑171 (NFT), NEP‑413 (signed messages)
- Bridges & Aurora EVM compatibility

---

## Developer Tooling
- near‑api‑js / @near‑js/* for RPC
- Wallets (MyNearWallet, others)
- Next.js App Router + React 19
- XState for long‑lived flows
- Supabase for persistence (gifts, WebAuthn)

---

## Demo Overview
- Two flows: Create Gift, View/Claim Gift
- Minimal UI; explicit state; client‑side encryption
- Uses Intents SDK + relay for publishing signed intents

---

## Architecture (High‑Level)
- Pages: `/gift-card/create-gift`, `/gift-card/view-gift`
- Gift components under `features/gift`
- XState actors: sign, claim, public key verifier
- Modals via a tiny React context
- API routes persist encrypted payloads

---

## Create Gift (Flow)
1) Select token, amount, optional image
2) Build wallet message (NEP‑413/EIP‑191)
3) Sign in wallet → local verification
4) Encrypt payload (AES‑GCM)
5) POST `/api/gifts` to save
6) Show shareable link (URL hash)

---

## View/Claim (Flow)
1) Parse/decrypt URL hash payload
2) Taker signs claim intent
3) Publish via relay, optionally wait
4) Show success & next steps

---

## State Machines (Why)
- Cross wallet + network boundaries → error‑prone
- XState gives visibility, retries, guarded transitions
- Reusable signer flow via `signIntentMachine`

---

## Security Notes
- Client‑side encryption before persistence
- Always verify signatures locally
- URL hash → payload not sent in HTTP by default

---

## Extending the Demo
- Add USD prices or balances
- Support additional wallets / signature schemes
- Replace modal UI; keep context
- Track analytics via `src/utils/logger.ts`

---

## Production Considerations
- Error boundaries & UX fallbacks
- Logging/observability (server + client)
- API/auth hardening, quotas, rate limiting
- Release cadence & feature flags

---

## Start Your Own App
- Scaffold Next.js App Router
- Typed envs; minimal state model
- Implement sign/verify first
- Add one end‑to‑end feature before expanding

---

## Resources
- NEAR docs & NEP standards
- XState docs
- Next.js App Router docs
- Supabase docs
- Intents SDK

---

## Q&A
- Ask anything about NEAR, this demo, or your use case
