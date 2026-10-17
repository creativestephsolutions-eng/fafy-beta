-- FAFY member invite/referral system. Run in Supabase SQL Editor (fafy-beta project).
-- Every member gets a unique invite code. Friends who sign up with it get their
-- first Core month for $7; when 5 invitees hold active subscriptions, the inviter
-- gets a free month (applied via Stripe in the app/webhook layer).

alter table public.profiles add column if not exists invite_code text;
alter table public.profiles add column if not exists invited_by uuid references public.profiles(id) on delete set null;
alter table public.profiles add column if not exists invite_reward_given boolean not null default false;
alter table public.profiles add column if not exists invite_discount_used boolean not null default false;

-- Backfill unique invite codes for existing members (8 unambiguous chars).
update public.profiles
set invite_code = (
  select string_agg(c, '')
  from (
    select substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + (floor(random() * 32)::int), 1) as c
    from generate_series(1, 8)
  ) s
)
where invite_code is null;

-- Resolve the (astronomically unlikely) collisions with a second pass.
update public.profiles p
set invite_code = (
  select string_agg(c, '')
  from (
    select substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + (floor(random() * 32)::int), 1) as c
    from generate_series(1, 8)
  ) s
)
where exists (
  select 1 from public.profiles q
  where q.invite_code = p.invite_code and q.id <> p.id
);

alter table public.profiles alter column invite_code set not null;
create unique index if not exists profiles_invite_code_key on public.profiles (invite_code);
create index if not exists profiles_invited_by_idx on public.profiles (invited_by);
