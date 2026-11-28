-- =============================================================================
-- Task 2.6: weekly repeating events
-- An event with repeat_days repeats every week on those weekdays, at the same
-- local time as its first occurrence (start_at / end_at), until repeat_until.
-- Occurrences are computed by the app; only the series is stored.
-- =============================================================================

alter table public.events
  -- ISO weekdays: 1 = Monday ... 7 = Sunday. null = does not repeat.
  add column repeat_days  smallint[],
  -- Last date (in the user's timezone) an occurrence may fall on. null = forever.
  add column repeat_until date;

comment on column public.events.repeat_days is
  'ISO weekdays (1 = Monday ... 7 = Sunday) the event repeats on every week; null = one-off.';
comment on column public.events.repeat_until is
  'Last local date of the series; null = repeats forever.';

alter table public.events
  add constraint events_repeat_days_valid check (
    repeat_days is null
    or (cardinality(repeat_days) between 1 and 7
        and repeat_days <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[])
  ),
  add constraint events_repeat_until_needs_days check (
    repeat_until is null or repeat_days is not null
  ),
  -- Each occurrence must fit within a day's span so it can be repeated safely.
  add constraint events_repeat_within_24h check (
    repeat_days is null or end_at - start_at <= interval '24 hours'
  );

-- The table uses column-level privileges (Task 2.1), so new columns must be granted.
grant insert (repeat_days, repeat_until) on public.events to authenticated;
grant update (repeat_days, repeat_until) on public.events to authenticated;

-- The week view also asks for "my repeating events that started before this week ends".
create index events_recurring_user_id_start_at_idx
  on public.events (user_id, start_at)
  where repeat_days is not null;
