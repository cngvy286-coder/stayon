-- =============================================================================
-- Task 1.1: profiles table
-- One row per user, created automatically when someone signs up.
-- Login data (email, password) stays in auth.users, managed by Supabase Auth.
-- =============================================================================

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 50),
  avatar_url   text,
  -- IANA timezone, used later for reminders and focus-mode time windows.
  timezone     text not null default 'Asia/Ho_Chi_Minh',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'Public profile data for each user. 1-1 with auth.users.';

-- -----------------------------------------------------------------------------
-- Row Level Security: a user can only see and edit their own profile.
-- No insert policy (rows are created by the trigger below).
-- No delete policy (the row is removed with the auth user via on delete cascade).
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- -----------------------------------------------------------------------------
-- Table privileges (defence in depth on top of RLS):
-- anonymous visitors get nothing; signed-in users may read and edit only
-- the editable columns (not id or timestamps).
-- -----------------------------------------------------------------------------
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url, timezone) on public.profiles to authenticated;

-- -----------------------------------------------------------------------------
-- Keep updated_at current on every update.
-- -----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Create a profile automatically when a new user signs up.
-- security definer: runs with the owner's rights so it can insert despite RLS.
-- search_path = '' and fully-qualified names prevent search_path hijacking.
-- -----------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(trim(left(new.raw_user_meta_data ->> 'display_name', 50)), '')
  );
  return new;
end;
$$;

-- Only the auth trigger should run this function, never API callers.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
