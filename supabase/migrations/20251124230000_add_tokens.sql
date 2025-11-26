-- Add token balances and transactions
create extension if not exists pgcrypto;

-- Add balances to users (safe alter)
alter table if exists public.users
  add column if not exists love_balance numeric default 0,
  add column if not exists love2_balance numeric default 0;

-- Token transactions table
create table if not exists public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('earn','spend','adjust')),
  token_type text not null check (token_type in ('LOVE','LOVE2')),
  amount numeric not null,
  balance_before numeric,
  balance_after numeric,
  description text,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz default now()
);

alter table public.token_transactions enable row level security;

-- Drop existing policies if they exist
drop policy if exists "token_transactions_select_own" on public.token_transactions;
drop policy if exists "token_transactions_insert_own" on public.token_transactions;

-- Create policies with proper casting
create policy "token_transactions_select_own"
  on public.token_transactions for select
  using (auth.uid() = user_id);

create policy "token_transactions_insert_own"
  on public.token_transactions for insert
  with check (auth.uid() = user_id);
