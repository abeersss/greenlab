-- GreenLab gamification schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Safe to re-run: every statement is idempotent.

-- 1. Profiles: one row per learner, holds the public display name shown on
--    the leaderboard so we never expose real emails there.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Learner',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users see all display names" on public.profiles;
create policy "Users see all display names"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Auto-create a profile row whenever someone signs up, defaulting the
-- display name to the part of their email before the @.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(split_part(new.email, '@', 1), 'Learner'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: the trigger above only fires for future signups. Anyone who
-- signed up before this migration ran has no profiles row yet, which
-- makes them invisible to the leaderboard view below. Safe to re-run.
insert into public.profiles (id, display_name)
select id, coalesce(split_part(email, '@', 1), 'Learner')
from auth.users
on conflict (id) do nothing;

-- 2. Puzzle completions: one row per learner per puzzle. XP is only
--    awarded the first time a given puzzle is solved so replaying for
--    practice doesn't inflate the leaderboard.
create table if not exists public.puzzle_completions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  puzzle_key text not null check (puzzle_key in ('network','soc','cloud','ai','dev')),
  xp_awarded int not null default 50,
  completed_at timestamptz not null default now(),
  unique (user_id, puzzle_key)
);

alter table public.puzzle_completions enable row level security;

drop policy if exists "Users record their own completions" on public.puzzle_completions;
create policy "Users record their own completions"
on public.puzzle_completions for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users see only their own completions" on public.puzzle_completions;
create policy "Users see only their own completions"
on public.puzzle_completions for select
to authenticated
using ((select auth.uid()) = user_id);

-- 3. Public leaderboard view: aggregated XP + display name only, no
--    emails or user ids exposed. Views run with the privileges of their
--    owner by default, so this can read across all learners even though
--    the base table's RLS policies restrict each learner to their own rows.
create or replace view public.leaderboard as
select
  p.display_name,
  coalesce(sum(pc.xp_awarded), 0) as total_xp,
  count(pc.id) as puzzles_completed
from public.profiles p
left join public.puzzle_completions pc on pc.user_id = p.id
group by p.id, p.display_name
order by total_xp desc, puzzles_completed desc;

grant select on public.leaderboard to authenticated;
