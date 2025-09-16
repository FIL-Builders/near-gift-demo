-- Add optional image CID to gifts for Lighthouse uploads
alter table "public"."gifts"
  add column if not exists "image_cid" text null;

-- Ensure anon/authenticated/service_role can still operate on table
-- (column-level grants inherit from table privileges)
