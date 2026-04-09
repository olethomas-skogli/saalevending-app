-- Sålevending Tournament Registration Platform
-- Database Schema for Supabase

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- Extends auth.users with application-specific fields
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  snapchat_username text,
  phone text not null default '',
  birth_date date,
  bydel text not null default '' check (
    bydel = '' or bydel in (
      'Alna', 'Bjerke', 'Frogner', 'Gamle Oslo', 'Grunerløkka',
      'Grorud', 'Nordre Aker', 'Nordstrand', 'Sagene', 'St. Hanshaugen',
      'Stovner', 'Søndre Nordstrand', 'Ullern', 'Vestre Aker', 'Østensjø'
    )
  ),
  role text not null default 'user' check (role in ('user', 'admin')),
  profile_completed boolean not null default false,
  consent_given_at timestamptz,
  parental_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profiles: anyone authenticated can read basic profile info
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (true);

-- Profiles: users can update their own profile (but not role)
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- Trigger: auto-create profile when auth.users row is inserted
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TOURNAMENTS
-- ============================================================
create table public.tournaments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  location text,
  event_date timestamptz,
  registration_deadline timestamptz,
  max_teams integer not null default 64,
  status text not null default 'draft' check (
    status in ('draft', 'registration_open', 'registration_closed', 'in_progress', 'completed')
  ),
  practical_info text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tournaments enable row level security;

-- Tournaments: all authenticated users can read non-draft tournaments
create policy "tournaments_select"
  on public.tournaments for select
  to authenticated
  using (status != 'draft' or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Tournaments: only admins can insert
create policy "tournaments_insert_admin"
  on public.tournaments for insert
  to authenticated
  with check (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Tournaments: only admins can update
create policy "tournaments_update_admin"
  on public.tournaments for update
  to authenticated
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create trigger tournaments_updated_at
  before update on public.tournaments
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TEAMS
-- Core registration entity with all form fields
-- ============================================================
create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  captain_id uuid not null references public.profiles(id),
  team_name text not null,
  team_type text not null check (team_type in ('guttelag', 'jentelag')),
  age_group text not null check (age_group in ('2007', '2008', '2009', '2010', '2011', '2012')),
  previous_participation boolean not null default false,
  bydel text not null check (
    bydel in (
      'Alna', 'Bjerke', 'Frogner', 'Gamle Oslo', 'Grunerløkka',
      'Grorud', 'Nordre Aker', 'Nordstrand', 'Sagene', 'St. Hanshaugen',
      'Stovner', 'Søndre Nordstrand', 'Ullern', 'Vestre Aker', 'Østensjø'
    )
  ),
  schools text not null,
  club_players text not null check (club_players in ('alle', 'noen', 'ingen')),
  allergies text[] not null default '{}',
  motivation text,
  invite_code text unique not null default encode(gen_random_bytes(4), 'hex'),
  status text not null default 'pending' check (
    status in ('pending', 'qualified', 'waitlist', 'rejected')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Prevent same captain from registering multiple teams per tournament
  unique (tournament_id, captain_id),
  -- Prevent duplicate team names within a tournament
  unique (tournament_id, team_name)
);

alter table public.teams enable row level security;

-- Teams: authenticated users can read teams in their tournaments
create policy "teams_select"
  on public.teams for select
  to authenticated
  using (true);

-- Teams: authenticated users can create a team (if tournament is open)
create policy "teams_insert"
  on public.teams for insert
  to authenticated
  with check (
    captain_id = auth.uid()
    and exists (
      select 1 from public.tournaments
      where id = tournament_id
      and status = 'registration_open'
      and (registration_deadline is null or registration_deadline > now())
    )
  );

-- Teams: captains can update their own team
create policy "teams_update_captain"
  on public.teams for update
  to authenticated
  using (captain_id = auth.uid())
  with check (captain_id = auth.uid());

-- Teams: admins can update any team (for qualification status)
create policy "teams_update_admin"
  on public.teams for update
  to authenticated
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Teams: captains can delete their own team (withdraw)
create policy "teams_delete_captain"
  on public.teams for delete
  to authenticated
  using (captain_id = auth.uid());

create trigger teams_updated_at
  before update on public.teams
  for each row execute function public.handle_updated_at();

-- Index for invite code lookups
create index idx_teams_invite_code on public.teams(invite_code);

-- ============================================================
-- TEAM MEMBERS
-- Join table between teams and profiles
-- ============================================================
create table public.team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'player' check (role in ('captain', 'player')),
  joined_at timestamptz not null default now(),

  -- Prevent duplicate membership
  unique (team_id, user_id)
);

alter table public.team_members enable row level security;

-- Team members: anyone authenticated can read
create policy "team_members_select"
  on public.team_members for select
  to authenticated
  using (true);

-- Team members: captain can add members, or user can add themselves (join via invite)
create policy "team_members_insert"
  on public.team_members for insert
  to authenticated
  with check (
    -- User is adding themselves (joining via invite link)
    user_id = auth.uid()
    or
    -- Captain is adding a player to their team
    exists (
      select 1 from public.teams
      where id = team_id and captain_id = auth.uid()
    )
  );

-- Team members: captain can remove members, or user can remove themselves
create policy "team_members_delete"
  on public.team_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.teams
      where id = team_id and captain_id = auth.uid()
    )
  );

-- Trigger: prevent player from joining multiple teams in the same tournament
create or replace function public.prevent_multi_team_membership()
returns trigger
language plpgsql
as $$
declare
  v_tournament_id uuid;
begin
  -- Get the tournament for this team
  select tournament_id into v_tournament_id
  from public.teams
  where id = new.team_id;

  -- Check if user is already on another team in this tournament
  if exists (
    select 1
    from public.team_members tm
    join public.teams t on t.id = tm.team_id
    where tm.user_id = new.user_id
    and t.tournament_id = v_tournament_id
    and tm.team_id != new.team_id
  ) then
    raise exception 'User is already a member of another team in this tournament';
  end if;

  return new;
end;
$$;

create trigger check_multi_team_membership
  before insert on public.team_members
  for each row execute function public.prevent_multi_team_membership();

-- Trigger: auto-add captain as team member when team is created
create or replace function public.auto_add_captain()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.captain_id, 'captain');
  return new;
end;
$$;

create trigger on_team_created
  after insert on public.teams
  for each row execute function public.auto_add_captain();

-- ============================================================
-- MESSAGES
-- Admin to captain communication
-- ============================================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  recipient_id uuid references public.profiles(id),
  subject text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Messages: users can read messages sent to them, or broadcast messages for tournaments they're in
create policy "messages_select"
  on public.messages for select
  to authenticated
  using (
    recipient_id = auth.uid()
    or (
      recipient_id is null
      and exists (
        select 1 from public.teams
        where tournament_id = messages.tournament_id
        and captain_id = auth.uid()
      )
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Messages: only admins can send messages
create policy "messages_insert_admin"
  on public.messages for insert
  to authenticated
  with check (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Messages: recipients can mark as read
create policy "messages_update_read"
  on public.messages for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- ============================================================
-- INDEXES for common queries
-- ============================================================
create index idx_teams_tournament on public.teams(tournament_id);
create index idx_teams_captain on public.teams(captain_id);
create index idx_team_members_team on public.team_members(team_id);
create index idx_team_members_user on public.team_members(user_id);
create index idx_messages_recipient on public.messages(recipient_id);
create index idx_messages_tournament on public.messages(tournament_id);
