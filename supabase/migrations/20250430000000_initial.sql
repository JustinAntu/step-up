-- Step Up — initial schema (run via Supabase SQL editor or CLI: supabase db push)

-- Challenges (e.g. one active pilot challenge)
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  constraint challenges_date_range check (ends_on >= starts_on)
);

-- Teams belong to a challenge
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now()
);

create index if not exists teams_challenge_id_idx on public.teams (challenge_id);

-- Profile row per auth user (trigger below keeps in sync on signup)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  timezone text not null default 'UTC',
  team_id uuid references public.teams (id) on delete set null,
  role text not null default 'participant' check (role in ('participant', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_team_id_idx on public.profiles (team_id);

-- One row per user per local calendar day (interpretation: user's timezone on client; store date as given)
create table if not exists public.daily_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  step_date date not null,
  steps integer not null check (steps >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, step_date)
);

create index if not exists daily_steps_user_date_idx on public.daily_steps (user_id, step_date desc);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists daily_steps_set_updated_at on public.daily_steps;
create trigger daily_steps_set_updated_at
  before update on public.daily_steps
  for each row execute function public.set_updated_at();

-- Auto-create profile on new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.challenges enable row level security;
alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.daily_steps enable row level security;

-- Challenges: readable by authenticated users (tighten later per org)
create policy "challenges_select_authenticated"
  on public.challenges for select
  to authenticated
  using (true);

-- Teams: readable by authenticated users in same challenge (simplified: any authenticated for pilot)
create policy "teams_select_authenticated"
  on public.teams for select
  to authenticated
  using (true);

-- Profiles: users can read/update own row
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Daily steps: users manage own rows only
create policy "daily_steps_select_own"
  on public.daily_steps for select
  to authenticated
  using (user_id = auth.uid());

create policy "daily_steps_insert_own"
  on public.daily_steps for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "daily_steps_update_own"
  on public.daily_steps for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "daily_steps_delete_own"
  on public.daily_steps for delete
  to authenticated
  using (user_id = auth.uid());
