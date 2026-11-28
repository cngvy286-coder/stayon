import { formatDayMonth, formatMinutes, minutesOfDay, toDateKey } from "@/lib/utils/date";
import type { CalendarEvent } from "@/types/event";
import type { Task } from "@/types/task";

import { REMINDER_MINUTES, type ReminderMinutes, reminderOptionLabel } from "./index";

const MINUTE_MS = 60 * 1000;

/** Reminders up to this far ahead are scheduled in the browser. */
export const REMINDER_HORIZON_MS = 24 * 60 * MINUTE_MS;
/** A reminder missed by up to this long (sleeping laptop, frozen tab) is still shown. */
export const REMINDER_GRACE_MS = 10 * MINUTE_MS;

export type Reminder = {
  /** Stable per item + fire time, so a reminder is shown only once. */
  id: string;
  /** When to show it (ISO, UTC). */
  fireAt: string;
  title: string;
  body: string;
  /** Page to open when the reminder is clicked. */
  href: string;
};

function isReminderMinutes(value: number | null): value is ReminderMinutes {
  return value !== null && (REMINDER_MINUTES as readonly number[]).includes(value);
}

/** "bắt đầu sau 15 phút" / "bắt đầu ngay bây giờ" */
function startsIn(minutes: ReminderMinutes) {
  return minutes === 0 ? "bắt đầu ngay bây giờ" : `bắt đầu sau ${reminderOptionLabel(minutes)}`;
}

/** "còn 1 giờ" / "đến hạn rồi" */
function dueIn(minutes: ReminderMinutes) {
  return minutes === 0 ? "đến hạn rồi" : `còn ${reminderOptionLabel(minutes)}`;
}

/** "17:00" today, otherwise "17:00 29/11". */
function timeLabel(instant: Date, now: Date, timeZone: string) {
  const time = formatMinutes(minutesOfDay(instant, timeZone));
  const day = toDateKey(instant, timeZone);
  return day === toDateKey(now, timeZone) ? time : `${time} ${formatDayMonth(day)}`;
}

/**
 * Turn events (repeating series already expanded into occurrences) and tasks into the
 * reminders due between `now - REMINDER_GRACE_MS` and `now + REMINDER_HORIZON_MS`, oldest first.
 * Done tasks and items without a reminder are skipped.
 */
export function buildReminders(
  events: CalendarEvent[],
  tasks: Task[],
  now: Date,
  timeZone: string,
): Reminder[] {
  const from = now.getTime() - REMINDER_GRACE_MS;
  const to = now.getTime() + REMINDER_HORIZON_MS;
  const inWindow = (fireAt: number) => fireAt >= from && fireAt <= to;
  const reminders: Reminder[] = [];

  for (const event of events) {
    const minutes = event.remind_before_minutes;
    if (!isReminderMinutes(minutes)) continue;
    const start = new Date(event.start_at);
    const fireAt = start.getTime() - minutes * MINUTE_MS;
    if (!inWindow(fireAt)) continue;

    const end = new Date(event.end_at);
    reminders.push({
      id: `event:${event.id}:${new Date(fireAt).toISOString()}`,
      fireAt: new Date(fireAt).toISOString(),
      title: `Sắp đến: ${event.title}`,
      body: `${timeLabel(start, now, timeZone)} – ${formatMinutes(minutesOfDay(end, timeZone))} · ${startsIn(minutes)}`,
      href: `/schedule?week=${toDateKey(start, timeZone)}`,
    });
  }

  for (const task of tasks) {
    const minutes = task.remind_before_minutes;
    if (task.status === "done" || !task.due_at || !isReminderMinutes(minutes)) continue;
    const due = new Date(task.due_at);
    const fireAt = due.getTime() - minutes * MINUTE_MS;
    if (!inWindow(fireAt)) continue;

    reminders.push({
      id: `task:${task.id}:${new Date(fireAt).toISOString()}`,
      fireAt: new Date(fireAt).toISOString(),
      title: `Sắp đến hạn: ${task.title}`,
      body: `Hạn ${timeLabel(due, now, timeZone)} · ${dueIn(minutes)}`,
      href: "/tasks",
    });
  }

  return reminders.sort((a, b) => a.fireAt.localeCompare(b.fireAt));
}
