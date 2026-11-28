-- =============================================================================
-- Task 3.1: tasks table (to-dos with due date, status and priority)
-- Same security pattern as public.events (Task 2.1): RLS + column privileges.
-- =============================================================================

create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title        text not null check (char_length(trim(title)) between 1 and 200),
  note         text check (char_length(note) <= 1000),
  -- Optional deadline, stored in UTC.
  due_at       timestamptz,
  status       text not null default 'todo'
               check (status in ('todo', 'doing', 'done')),
  priority     text not null default 'medium'
               check (priority in ('low', 'medium', 'high')),
  -- Set by the database when status becomes 'done', cleared when it leaves 'done'.
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint tasks_completed_only_when_done check (
    (status = 'done') = (completed_at is not null)
  )
);

comment on table public.tasks is 'To-dos owned by a user.';
comment on column public.tasks.completed_at is
  'When the task was marked done; maintained by the tasks_set_completed_at trigger.';

-- "My unfinished tasks, soonest deadline first" and progress counts by status.
create index tasks_user_id_status_due_at_idx on public.tasks (user_id, status, due_at);

-- -----------------------------------------------------------------------------
-- Row Level Security: each user can only see and change their own tasks.
-- -----------------------------------------------------------------------------
alter table public.tasks enable row level security;

create policy "Users can view their own tasks"
  on public.tasks for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own tasks"
  on public.tasks for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Table privileges (defence in depth on top of RLS):
-- anonymous visitors get nothing; signed-in users can write only the editable
-- columns. user_id, completed_at and timestamps are filled by the database.
-- -----------------------------------------------------------------------------
revoke all on public.tasks from anon, authenticated;
grant select, delete on public.tasks to authenticated;
grant insert (title, note, due_at, status, priority) on public.tasks to authenticated;
grant update (title, note, due_at, status, priority) on public.tasks to authenticated;

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

-- Reuse the updated_at trigger function from the profiles migration.
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Keep completed_at in step with status.
create function public.set_task_completed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'done' then
    -- Keep the original time if the task was already done.
    if tg_op = 'INSERT' or old.status is distinct from 'done' then
      new.completed_at = now();
    else
      new.completed_at = old.completed_at;
    end if;
  else
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger tasks_set_completed_at
  before insert or update of status on public.tasks
  for each row execute function public.set_task_completed_at();
