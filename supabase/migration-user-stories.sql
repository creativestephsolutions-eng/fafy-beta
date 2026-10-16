-- FAFY user stories migration. Run in Supabase SQL Editor (fafy-beta project).
-- Profile stories (private to profile viewers) + members-only community stories
-- (anonymous publicly; only admin sees authors).

create table public.user_stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  body text not null,
  status text not null default 'private'
    check (status in ('private', 'pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.story_votes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.user_stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote text not null check (vote in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  unique(story_id, user_id)
);

alter table public.user_stories enable row level security;
alter table public.story_votes enable row level security;

-- user_stories: authors read/manage their own; admin sees all;
-- confirmed friends can read each other's private (profile-only) stories.
-- Approved stories are read through the app (service role) with author_id
-- deliberately excluded, so no broad member select policy exists here.
create policy "authors read own stories" on public.user_stories for select
  using (auth.uid() = author_id);
create policy "admin reads all stories" on public.user_stories for select
  using (public.is_admin());
create policy "friends read private stories" on public.user_stories for select
  using (
    status = 'private' and exists (
      select 1 from public.friend_requests fr
      where fr.status = 'accepted'
        and (
          (fr.from_user = auth.uid() and fr.to_user = public.user_stories.author_id)
          or (fr.from_user = public.user_stories.author_id and fr.to_user = auth.uid())
        )
    )
  );
create policy "authors insert own stories" on public.user_stories for insert
  with check (auth.uid() = author_id);
create policy "authors update own stories" on public.user_stories for update
  using (auth.uid() = author_id);
create policy "authors delete own stories" on public.user_stories for delete
  using (auth.uid() = author_id);
create policy "admin manages stories" on public.user_stories for all
  using (public.is_admin());

-- story_votes: users read/manage their own votes; admin sees all.
-- Counts are aggregated server-side; no broad read policy.
create policy "users read own votes" on public.story_votes for select
  using (auth.uid() = user_id);
create policy "admin reads all votes" on public.story_votes for select
  using (public.is_admin());
create policy "users insert own votes" on public.story_votes for insert
  with check (auth.uid() = user_id);
create policy "users update own votes" on public.story_votes for update
  using (auth.uid() = user_id);
create policy "users delete own votes" on public.story_votes for delete
  using (auth.uid() = user_id);
create policy "admin manages votes" on public.story_votes for all
  using (public.is_admin());
