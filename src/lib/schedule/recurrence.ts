import { addDays, isoWeekday, minutesOfDay, toDateKey, zonedTimeToUtc } from "@/lib/utils/date";
import type { CalendarEvent } from "@/types/event";

const MINUTE_MS = 60 * 1000;

/**
 * Replace each repeating event with its occurrences in the week starting on `weekStart`
 * (a Monday date key). One-off events pass through unchanged.
 *
 * An occurrence keeps the series' local start time and duration on every matching weekday,
 * from the series' first date up to `repeat_until` (inclusive). Each occurrence carries the
 * series' own times in `series` so the edit form can show the original values.
 */
export function expandRecurringEvents(
  events: CalendarEvent[],
  weekStart: string,
  timeZone: string,
): CalendarEvent[] {
  const result: CalendarEvent[] = [];

  for (const event of events) {
    if (!event.repeat_days || event.repeat_days.length === 0) {
      result.push(event);
      continue;
    }

    const start = new Date(event.start_at);
    const firstDate = toDateKey(start, timeZone);
    const startMin = minutesOfDay(start, timeZone);
    const durationMin = Math.round(
      (new Date(event.end_at).getTime() - start.getTime()) / MINUTE_MS,
    );

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      // Date keys are YYYY-MM-DD, so string comparison matches date order.
      if (day < firstDate) continue;
      if (event.repeat_until && day > event.repeat_until) continue;
      if (!event.repeat_days.includes(isoWeekday(day))) continue;

      result.push({
        ...event,
        start_at: zonedTimeToUtc(day, startMin, timeZone).toISOString(),
        end_at: zonedTimeToUtc(day, startMin + durationMin, timeZone).toISOString(),
        series: { start_at: event.start_at, end_at: event.end_at },
      });
    }
  }

  return result;
}
