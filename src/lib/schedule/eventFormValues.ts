import { reminderToFormValue } from "@/lib/reminders";
import { formatMinutes, minutesOfDay, toDateKey } from "@/lib/utils/date";
import type { CalendarEvent, EventColor } from "@/types/event";

/** Values of the event form, as strings the way the inputs hold them. */
export type EventFormValues = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: EventColor;
  note: string;
  /** "on" when "Lặp lại hàng tuần" is ticked, otherwise "". */
  repeat: string;
  /** ISO weekdays joined by commas, e.g. "1,3". */
  repeatDays: string;
  /** "YYYY-MM-DD" or "". */
  repeatUntil: string;
  /** Minutes before as a string, or "" for no reminder. */
  remindBefore: string;
};

/**
 * Turn a stored event (UTC) into the values shown in the edit form (the user's timezone).
 * For an occurrence of a repeating event, the series' own first date and times are used.
 * `spansDays` is true when the event ends on a later day; the form can't edit those.
 */
export function eventToFormValues(
  event: CalendarEvent,
  timeZone: string,
): EventFormValues & { spansDays: boolean } {
  const start = new Date(event.series?.start_at ?? event.start_at);
  const end = new Date(event.series?.end_at ?? event.end_at);
  const date = toDateKey(start, timeZone);
  const repeating = Boolean(event.repeat_days && event.repeat_days.length > 0);

  return {
    title: event.title,
    date,
    startTime: formatMinutes(minutesOfDay(start, timeZone)),
    endTime: formatMinutes(minutesOfDay(end, timeZone)),
    color: event.color,
    note: event.note ?? "",
    repeat: repeating ? "on" : "",
    repeatDays: repeating ? event.repeat_days!.join(",") : "",
    repeatUntil: event.repeat_until ?? "",
    remindBefore: reminderToFormValue(event.remind_before_minutes),
    spansDays: toDateKey(end, timeZone) !== date,
  };
}
