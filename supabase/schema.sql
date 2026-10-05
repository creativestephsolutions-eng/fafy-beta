-- FAFY beta schema. Run in Supabase SQL Editor (fafy-beta project).

-- Helper: is the current user the founder/admin?
create or replace function public.is_admin()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

-- ============ ACCOUNTS ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  plan text not null default 'core' check (plan in ('core','plus')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "read own or admin" on public.profiles for select
  using (auth.uid() = id or public.is_admin());
create policy "admin manages" on public.profiles for all
  using (public.is_admin());

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null check (plan in ('core','plus')),
  status text not null default 'active' check (status in ('active','canceled','past_due','trialing')),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "read own or admin" on public.subscriptions for select
  using (auth.uid() = user_id or public.is_admin());
create policy "admin manages" on public.subscriptions for all
  using (public.is_admin());

-- ============ WRITING ============
create table public.writing_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  series_label text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.writing_posts enable row level security;
create policy "anyone authed reads" on public.writing_posts for select
  to authenticated using (true);
create policy "admin writes" on public.writing_posts for all
  using (public.is_admin());

create table public.writing_questions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.writing_posts(id) on delete cascade,
  position int not null default 0,
  body text not null
);
alter table public.writing_questions enable row level security;
create policy "anyone authed reads" on public.writing_questions for select
  to authenticated using (true);
create policy "admin writes" on public.writing_questions for all
  using (public.is_admin());

-- enforced: one answer per member per question, any order
create table public.writing_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.writing_questions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  unique (question_id, user_id)
);
alter table public.writing_answers enable row level security;
create policy "anyone authed reads" on public.writing_answers for select
  to authenticated using (true);
create policy "insert own" on public.writing_answers for insert
  to authenticated with check (auth.uid() = user_id);
create policy "admin deletes" on public.writing_answers for delete
  using (public.is_admin());

create table public.writing_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.writing_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.writing_comments enable row level security;
create policy "anyone authed reads" on public.writing_comments for select
  to authenticated using (true);
create policy "insert own" on public.writing_comments for insert
  to authenticated with check (auth.uid() = user_id);
create policy "admin deletes" on public.writing_comments for delete
  using (public.is_admin());

-- ============ ROOMS ============
create table public.room_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting','matched')),
  created_at timestamptz not null default now()
);
alter table public.room_queue enable row level security;
create policy "own rows" on public.room_queue for all
  to authenticated using (auth.uid() = user_id or public.is_admin());

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  topic_question text not null,
  status text not null default 'active' check (status in ('active','ended')),
  round int not null default 1,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);
alter table public.rooms enable row level security;
create policy "members read their rooms" on public.rooms for select
  to authenticated using (
    public.is_admin() or exists (
      select 1 from public.room_members m
      where m.room_id = rooms.id and m.user_id = auth.uid()
    )
  );

create table public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  participant_label text not null check (participant_label in ('1','2')),
  left_at timestamptz,
  unique (room_id, user_id)
);
alter table public.room_members enable row level security;
create policy "members read their rooms" on public.room_members for select
  to authenticated using (
    public.is_admin() or exists (
      select 1 from public.room_members m
      where m.room_id = room_members.room_id and m.user_id = auth.uid()
    )
  );
create policy "admin writes" on public.room_members for all
  using (public.is_admin());

-- kind: answer | question | followup. revealed=false hides blind answers.
create table public.room_entries (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  round int not null default 1,
  kind text not null check (kind in ('answer','question','followup')),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  revealed boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.room_entries enable row level security;
create policy "members read" on public.room_entries for select
  to authenticated using (
    public.is_admin() or exists (
      select 1 from public.room_members m
      where m.room_id = room_entries.room_id and m.user_id = auth.uid()
    )
  );
create policy "members insert" on public.room_entries for insert
  to authenticated with check (
    auth.uid() = user_id and exists (
      select 1 from public.room_members m
      where m.room_id = room_entries.room_id and m.user_id = auth.uid()
    )
  );
create policy "admin updates" on public.room_entries for update
  using (public.is_admin());

create table public.resonance (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.room_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (entry_id, user_id)
);
alter table public.resonance enable row level security;
create policy "members manage own" on public.resonance for all
  to authenticated using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id);

-- ============ LADDER ============
create table public.ladder_invites (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open','accepted','declined')),
  created_at timestamptz not null default now()
);
alter table public.ladder_invites enable row level security;
create policy "parties read" on public.ladder_invites for select
  to authenticated using (
    public.is_admin() or auth.uid() = from_user or auth.uid() = to_user
  );
create policy "parties manage" on public.ladder_invites for all
  to authenticated using (
    public.is_admin() or auth.uid() = from_user or auth.uid() = to_user
  ) with check (auth.uid() = from_user or public.is_admin());

create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open','accepted','declined')),
  created_at timestamptz not null default now(),
  unique (from_user, to_user)
);
alter table public.friend_requests enable row level security;
create policy "parties read" on public.friend_requests for select
  to authenticated using (
    public.is_admin() or auth.uid() = from_user or auth.uid() = to_user
  );
create policy "parties manage" on public.friend_requests for all
  to authenticated using (
    public.is_admin() or auth.uid() = from_user or auth.uid() = to_user
  ) with check (auth.uid() = from_user or public.is_admin());

-- ============ COMMONS ============
create table public.commons_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.commons_posts enable row level security;
create policy "read all" on public.commons_posts for select to authenticated using (true);
create policy "insert own" on public.commons_posts for insert
  to authenticated with check (auth.uid() = user_id);
create policy "admin deletes" on public.commons_posts for delete using (public.is_admin());

create table public.commons_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.commons_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.commons_comments enable row level security;
create policy "read all" on public.commons_comments for select to authenticated using (true);
create policy "insert own" on public.commons_comments for insert
  to authenticated with check (auth.uid() = user_id);
create policy "admin deletes" on public.commons_comments for delete using (public.is_admin());

-- ============ SHIT-TALKING ROOM ============
create table public.shit_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  removed boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.shit_posts enable row level security;
create policy "read visible" on public.shit_posts for select
  to authenticated using (removed = false or public.is_admin());
create policy "insert own" on public.shit_posts for insert
  to authenticated with check (auth.uid() = user_id);
create policy "admin updates" on public.shit_posts for update using (public.is_admin());

create table public.shit_flags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.shit_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  note text,
  status text not null default 'open' check (status in ('open','kept','removed')),
  created_at timestamptz not null default now()
);
alter table public.shit_flags enable row level security;
create policy "insert own" on public.shit_flags for insert
  to authenticated with check (auth.uid() = user_id);
create policy "read own or admin" on public.shit_flags for select
  to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "admin manages" on public.shit_flags for all using (public.is_admin());

-- ============ COACHING ============
create table public.ask_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question text not null,
  answer text,
  price_cents int not null default 700,
  status text not null default 'open' check (status in ('open','answered','refunded')),
  created_at timestamptz not null default now(),
  answered_at timestamptz
);
alter table public.ask_questions enable row level security;
create policy "read own or admin" on public.ask_questions for select
  to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "insert own" on public.ask_questions for insert
  to authenticated with check (auth.uid() = user_id);
create policy "admin manages" on public.ask_questions for all using (public.is_admin());

create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  seats int not null default 12,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.live_sessions enable row level security;
create policy "read all" on public.live_sessions for select to authenticated using (true);
create policy "admin writes" on public.live_sessions for all using (public.is_admin());

create table public.session_registrations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, user_id)
);
alter table public.session_registrations enable row level security;
create policy "read own or admin" on public.session_registrations for select
  to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "insert own" on public.session_registrations for insert
  to authenticated with check (auth.uid() = user_id);
create policy "admin manages" on public.session_registrations for all using (public.is_admin());

-- ============ ROOM REPORTS ============
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete set null,
  reporter_user_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete set null,
  note text,
  status text not null default 'open' check (status in ('open','reviewed','dismissed')),
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;
create policy "insert own" on public.reports for insert
  to authenticated with check (auth.uid() = reporter_user_id);
create policy "read own or admin" on public.reports for select
  to authenticated using (auth.uid() = reporter_user_id or public.is_admin());
create policy "admin manages" on public.reports for all using (public.is_admin());

-- ============ SEED: Writing post #1 ============
-- (Run the app once and publish from Admin instead if you prefer; this seeds
--  the post + questions so the beta opens with content. Replace <ADMIN_UID>
--  after the founder signs up, or run via the Admin composer.)
-- insert into public.writing_posts (id, title, body, series_label, created_by)
-- values (
--   '00000000-0000-0000-0000-000000000001',
--   'Sayings, #1: "It Is What It Is"',
--   '...full approved text...',
--   'Sayings Series · #1',
--   '<ADMIN_UID>'
-- );
-- insert into public.writing_questions (post_id, position, body) values
--   ('00000000-0000-0000-0000-000000000001', 1, 'What''s the problem in your life right now that you''ve been answering with "it is what it is" — is that acceptance, or avoidance?'),
--   ('00000000-0000-0000-0000-000000000001', 2, 'When did a problem like that get worse because nobody touched it? What did waiting cost?'),
--   ('00000000-0000-0000-0000-000000000001', 3, 'What''s the smallest concrete move you could make on yours this week?');
