-- Create gifts table for Gift feature
create table if not exists public.gifts (
  gift_id uuid primary key,
  encrypted_payload text not null,
  p_key text not null,
  -- Optional image CID for Lighthouse/IPFS uploads
  image_cid text null,
  created_at timestamptz not null default now()
);

-- Optional: index for faster lookups by gift_id (primary key already indexed)
-- create index if not exists idx_gifts_gift_id on public.gifts(gift_id);

-- Create WebAuthn credentials table (used by /api/webauthn_credentials)
create table if not exists public.webauthn_credentials (
  raw_id text primary key,
  public_key text not null,
  hostname text not null,
  created_at timestamptz not null default now()
);

-- Optional: solver_liquidity table placeholder (read-only UI); safe to omit if unused
-- create table if not exists public.solver_liquidity (
--   id bigserial primary key,
--   updated_at timestamptz not null default now(),
--   payload jsonb not null default '{}'
-- );
