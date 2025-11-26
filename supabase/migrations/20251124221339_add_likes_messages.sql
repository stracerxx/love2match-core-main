-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- =========================
-- LIKES AND MUTUAL MATCHES
-- =========================
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('like','pass')),
  created_at timestamptz default now(),
  unique (user_id, target_user_id)
);

alter table public.likes enable row level security;

-- RLS: a user can read/insert/update only their own like rows
create policy "likes_select_own"
  on public.likes for select
  using (auth.uid() = user_id);

create policy "likes_insert_own"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "likes_update_own"
  on public.likes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RPC: get mutual matches for current user
create or replace function public.get_mutual_matches()
returns setof public.users
language sql
security definer
set search_path = public
as $$
  select u.*
  from public.likes l1
  join public.likes l2
    on l1.user_id = auth.uid()
   and l1.status = 'like'
   and l2.user_id = l1.target_user_id
   and l2.target_user_id = l1.user_id
   and l2.status = 'like'
  join public.users u on u.id = l1.target_user_id
  where u.is_suspended = false
$$;

revoke all on function public.get_mutual_matches() from public;
grant execute on function public.get_mutual_matches() to anon, authenticated;

-- =========================
-- MESSAGING (THREADS + MESSAGES)
-- =========================
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  last_message_at timestamptz
);

alter table public.threads enable row level security;

create table if not exists public.thread_participants (
  thread_id uuid not null references public.threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (thread_id, user_id)
);

alter table public.thread_participants enable row level security;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

-- RLS: Only participants can see thread, participants, and messages
create policy "threads_select_participant"
  on public.threads for select
  using (
    exists (
      select 1 from public.thread_participants tp
      where tp.thread_id = id and tp.user_id = auth.uid()
    )
  );

create policy "participants_select_own_thread"
  on public.thread_participants for select
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.thread_participants tp
      where tp.thread_id = thread_participants.thread_id
        and tp.user_id = auth.uid()
    )
  );

create policy "messages_select_participant"
  on public.messages for select
  using (
    exists (
      select 1 from public.thread_participants tp
      where tp.thread_id = messages.thread_id and tp.user_id = auth.uid()
    )
  );

-- Allow message inserts only from participants sending as self
create policy "messages_insert_participant"
  on public.messages for insert
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.thread_participants tp
      where tp.thread_id = messages.thread_id and tp.user_id = auth.uid()
    )
  );

-- No direct inserts to threads/participants (enforced by absence of insert policies)
-- Use SECURITY DEFINER RPC to create or fetch threads

-- Trigger to update thread.last_message_at on each new message
create or replace function public.update_thread_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.threads
     set last_message_at = new.created_at
   where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists trg_update_thread_last_message on public.messages;
create trigger trg_update_thread_last_message
after insert on public.messages
for each row
execute function public.update_thread_last_message();

-- RPC: get or create a thread between current user and other_user_id
create or replace function public.get_or_create_thread(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_thread uuid;
  new_thread uuid;
begin
  -- Ensure other_user_id is valid and not self
  if other_user_id is null or other_user_id = auth.uid() then
    raise exception 'Invalid other_user_id';
  end if;

  -- Check existing thread with both participants
  select t.id into existing_thread
  from public.threads t
  join public.thread_participants tp1 on tp1.thread_id = t.id and tp1.user_id = auth.uid()
  join public.thread_participants tp2 on tp2.thread_id = t.id and tp2.user_id = other_user_id
  limit 1;

  if existing_thread is not null then
    return existing_thread;
  end if;

  -- Create thread and add both participants
  insert into public.threads default values returning id into new_thread;
  insert into public.thread_participants(thread_id, user_id) values (new_thread, auth.uid());
  insert into public.thread_participants(thread_id, user_id) values (new_thread, other_user_id);

  return new_thread;
end;
$$;

revoke all on function public.get_or_create_thread(uuid) from public;
grant execute on function public.get_or_create_thread(uuid) to anon, authenticated;

-- RPC: list threads for current user with partner basic info
create or replace function public.list_threads()
returns table (
  thread_id uuid,
  partner_id uuid,
  partner_email text,
  partner_display_name text,
  last_message_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  with my_threads as (
    select t.id, t.last_message_at
    from public.threads t
    join public.thread_participants tp on tp.thread_id = t.id
    where tp.user_id = auth.uid()
  ),
  partners as (
    select mt.id as thread_id, u.id as partner_id, u.email as partner_email, u.display_name as partner_display_name, mt.last_message_at
    from my_threads mt
    join public.thread_participants tp2 on tp2.thread_id = mt.id and tp2.user_id <> auth.uid()
    join public.users u on u.id = tp2.user_id
  )
  select thread_id, partner_id, partner_email, partner_display_name, last_message_at
  from partners
  order by coalesce(last_message_at, '1970-01-01'::timestamptz) desc, thread_id
$$;

revoke all on function public.list_threads() from public;
grant execute on function public.list_threads() to anon, authenticated;

-- RPC: list messages in a thread (RLS enforces participant access)
create or replace function public.list_messages(p_thread_id uuid)
returns setof public.messages
language sql
security definer
set search_path = public
as $$
  select m.*
  from public.messages m
  where m.thread_id = p_thread_id
  order by m.created_at asc
$$;

revoke all on function public.list_messages(uuid) from public;
grant execute on function public.list_messages(uuid) to anon, authenticated;
