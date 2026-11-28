import { formatMinutes, minutesOfDay, toDateKey } from "@/lib/utils/date";
import type { CalendarEvent, EventColor } from "@/types/event";

export type EventFormValues = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: EventColor;
  note: string;
};

/**
 * Turn a stored event (UTC) into the values shown in the edit form (the user's timezone).
 * `spansDays` is true when the event ends on a later day; the form can't edit those.
 */
export function eventToFormValues(
  event: CalendarEvent,
  timeZone: string,
): EventFormValues & { spansDays: boolean } {
  const start = new Date(event.start_at);
  const end = new Date(event.end_at);
  const date = toDateKey(start, timeZone);

  return {
    title: event.title,
    date,
    startTime: formatMinutes(minutesOfDay(start, timeZone)),
    endTime: formatMinutes(minutesOfDay(end, timeZone)),
    color: event.color,
    note: event.note ?? "",
    spansDays: toDateKey(end, timeZone) !== date,
  };
}
