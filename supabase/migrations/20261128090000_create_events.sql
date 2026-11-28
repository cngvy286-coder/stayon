-- =============================================================================
-- Task 2.1: events table (timetable entries: classes, meetings, study blocks)
-- Weekly repeating events are added later in Task 2.6 with a new migration.
-- =============================================================================

create table public.events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title      text not null check (char_length(trim(title)) between 1 and 100),
  note       text check (char_length(note) <= 1000),
  -- Stored in UTC; converted to the user's timezone (profiles.timezone) for display.
  start_at   timestamptz not null,
  end_at     timestamptz not null,
  -- Named colour from the app palette, not a raw hex value.
  color      text not null default 'brand'
             check (color in ('brand', 'teal', 'amber', 'rose', 'sky')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (end_at > start_at)
);

comment on table public.events is 'Timetable entries owned by a user.';

-- The week view always asks for "my events between two dates".
create index events_user_id_start_at_idx on public.events (user_id, start_at);

-- -----------------------------------------------------------------------------
-- Row Level Security: each user can only see and change their own events.
-- -----------------------------------------------------------------------------
alter table public.events enable row level security;

create policy "Users can view their own events"
  on public.events for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own events"
  on public.events for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own events"
  on public.events for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own events"
  on public.events for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Table privileges (defence in depth on top of RLS):
-- anonymous visitors get nothing; signed-in users can write only the editable
-- columns, so user_id always comes from the default auth.uid().
-- -----------------------------------------------------------------------------
revoke all on public.events from anon, authenticated;
grant select, delete on public.events to authenticated;
grant insert (title, note, start_at, end_at, color) on public.events to authenticated;
grant update (title, note, start_at, end_at, color) on public.events to authenticated;

-- Reuse the updated_at trigger function from the profiles migration.
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();
