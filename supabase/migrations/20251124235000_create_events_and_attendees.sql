-- Create events and attendees tables with RLS and triggers
create extension if not exists pgcrypto;

-- Events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date text,
  time text,
  location text,
  category text,
  attendees int default 0,
  created_by bigint,
  created_at timestamptz default now()
);

alter table public.events enable row level security;

-- Drop existing policies
drop policy if exists "events_select_public" on public.events;
drop policy if exists "events_insert_auth" on public.events;
drop policy if exists "events_update_owner" on public.events;

create policy "events_select_public"
  on public.events for select
  using (true);

create policy "events_insert_auth"
  on public.events for insert
  with check ((auth.uid()::text::bigint) = created_by);

create policy "events_update_owner"
  on public.events for update
  using ((auth.uid()::text::bigint) = created_by)
  with check ((auth.uid()::text::bigint) = created_by);

-- Attendees table
create table if not exists public.event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id bigint not null,
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

alter table public.event_attendees enable row level security;

-- Drop existing policies
drop policy if exists "attendees_select_public" on public.event_attendees;
drop policy if exists "attendees_insert_auth" on public.event_attendees;
drop policy if exists "attendees_delete_owner" on public.event_attendees;

create policy "attendees_select_public"
  on public.event_attendees for select
  using (true);

create policy "attendees_insert_auth"
  on public.event_attendees for insert
  with check ((auth.uid()::text::bigint) = user_id);

create policy "attendees_delete_owner"
  on public.event_attendees for delete
  using ((auth.uid()::text::bigint) = user_id);

-- Trigger to update events.attendees count
create or replace function public.update_event_attendees_count() returns trigger as supabase/migrations/20251124230000_add_tokens.sql
begin
  if (tg_op = 'INSERT') then
    update public.events set attendees = coalesce(attendees,0) + 1 where id = new.event_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.events set attendees = greatest(coalesce(attendees,0) - 1, 0) where id = old.event_id;
    return old;
  end if;
  return null;
end;
supabase/migrations/20251124230000_add_tokens.sql language plpgsql;

drop trigger if exists trg_update_attendees on public.event_attendees;
create trigger trg_update_attendees
  after insert or delete on public.event_attendees
  for each row execute procedure public.update_event_attendees_count();
