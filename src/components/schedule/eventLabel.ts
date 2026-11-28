import { reminderLabel } from "@/lib/reminders";
import type { CalendarEvent } from "@/types/event";

/** Append the reminder ("nhắc trước 15 phút") to an event's accessible label, if it has one. */
export function withReminder(label: string, event: CalendarEvent): string {
  const reminder = reminderLabel(event.remind_before_minutes);
  return reminder ? `${label}, ${reminder.toLowerCase()}` : label;
}
