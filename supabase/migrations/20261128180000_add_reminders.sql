-- =============================================================================
-- Task 4.1: "remind me N minutes before" for events and tasks
-- null = no reminder. The reminder fires N minutes before events.start_at
-- (each occurrence for repeating events) or before tasks.due_at.
-- Notifications themselves are shown by the app (Task 4.2).
-- =============================================================================

alter table public.events add column remind_before_minutes smallint;
alter table public.tasks  add column remind_before_minutes smallint;

comment on column public.events.remind_before_minutes is
  'Minutes before start_at to remind the user; null = no reminder.';
comment on column public.tasks.remind_before_minutes is
  'Minutes before due_at to remind the user; null = no reminder.';

-- Only the choices offered in the app: on time, 5/10/15/30 min, 1 hour, 1 day.
alter table public.events add constraint events_remind_before_valid check (
  remind_before_minutes is null or remind_before_minutes in (0, 5, 10, 15, 30, 60, 1440)
);
alter table public.tasks add constraint tasks_remind_before_valid check (
  remind_before_minutes is null or remind_before_minutes in (0, 5, 10, 15, 30, 60, 1440)
);

-- A task reminder needs a deadline to count back from.
alter table public.tasks add constraint tasks_reminder_needs_due_at check (
  remind_before_minutes is null or due_at is not null
);

-- Both tables use column-level privileges, so the new columns must be granted.
grant insert (remind_before_minutes), update (remind_before_minutes)
  on public.events to authenticated;
grant insert (remind_before_minutes), update (remind_before_minutes)
  on public.tasks to authenticated;
