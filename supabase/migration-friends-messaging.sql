-- FAFY: private profiles, friends, and direct messaging
-- Run this in Supabase SQL Editor (paste the whole thing, hit Run)

-- 1. Bio field on profiles
alter table public.profiles add column if not exists bio text default '';

-- 2. Helper: are two users confirmed friends?
create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.friend_requests
    where status = 'accepted'
      and ((from_user = a and to_user = b) or (from_user = b and to_user = a))
  );
$$;

-- 3. Let friends read each other's profiles (still private from everyone else)
drop policy if exists "read own or admin" on public.profiles;
create policy "read own, friends, or admin" on public.profiles for select
  using (
    auth.uid() = id
    or public.is_admin()
    or public.are_friends(auth.uid(), id)
  );

-- Let users update their own bio/username
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Direct messages between friends only
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
alter table public.direct_messages enable row level security;

drop policy if exists "friends read messages" on public.direct_messages;
create policy "friends read messages" on public.direct_messages for select
  to authenticated using (
    public.is_admin()
    or (auth.uid() = from_user and public.are_friends(auth.uid(), to_user))
    or (auth.uid() = to_user and public.are_friends(auth.uid(), from_user))
  );

drop policy if exists "friends send messages" on public.direct_messages;
create policy "friends send messages" on public.direct_messages for insert
  to authenticated with check (
    auth.uid() = from_user
    and public.are_friends(auth.uid(), to_user)
  );

create index if not exists direct_messages_convo_idx
  on public.direct_messages (least(from_user, to_user), greatest(from_user, to_user), created_at);
