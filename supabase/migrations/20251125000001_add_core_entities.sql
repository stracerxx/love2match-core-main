-- Core Entities Migration - Part 1
-- App Configuration and Swap Requests

-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- =========================
-- APP CONFIGURATION
-- =========================
create table if not exists public.app_config (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Default configuration values
insert into public.app_config (key, value, description) values
  ('love_to_love2_exchange_rate', '1.0', 'Exchange rate for LOVE to LOVE2 swaps'),
  ('daily_swap_limit_default', '1000', 'Default daily swap limit for users'),
  ('swap_approval_threshold', '100', 'Amount threshold requiring admin approval'),
  ('creator_verification_fee', '10', 'LOVE tokens required for creator verification'),
  ('referral_bonus', '50', 'LOVE tokens awarded for successful referrals')
on conflict (key) do nothing;

-- =========================
-- SWAP REQUESTS
-- =========================
create table if not exists public.swap_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  love_amount numeric not null check (love_amount > 0),
  love2_amount numeric not null check (love2_amount > 0),
  exchange_rate numeric not null,
  status text not null check (status in ('pending','approved','rejected','completed')) default 'pending',
  admin_notes text,
  rejected_reason text,
  approved_by uuid references auth.users(id),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.swap_requests enable row level security;

-- RLS: Users can see their own swap requests
create policy "swap_requests_select_own"
  on public.swap_requests for select
  using (auth.uid() = user_id);

create policy "swap_requests_insert_own"
  on public.swap_requests for insert
  with check (auth.uid() = user_id);

-- Admins can see all swap requests
create policy "swap_requests_select_admin"
  on public.swap_requests for select
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

create policy "swap_requests_update_admin"
  on public.swap_requests for update
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on public.app_config to authenticated;
grant all on public.swap_requests to authenticated;