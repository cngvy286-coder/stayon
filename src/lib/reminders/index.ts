import { z } from "zod";

/** Reminder choices, in minutes before the start / deadline. Must match the DB check constraints. */
export const REMINDER_MINUTES = [0, 5, 10, 15, 30, 60, 1440] as const;
export type ReminderMinutes = (typeof REMINDER_MINUTES)[number];

/** Option label in the "Nhắc trước" select. */
export function reminderOptionLabel(minutes: ReminderMinutes): string {
  if (minutes === 0) return "Đúng giờ";
  if (minutes === 60) return "1 giờ";
  if (minutes === 1440) return "1 ngày";
  return `${minutes} phút`;
}

/** Full label for a stored reminder, e.g. "Nhắc trước 15 phút". */
export function reminderLabel(minutes: number | null): string | null {
  if (minutes === null) return null;
  if (!(REMINDER_MINUTES as readonly number[]).includes(minutes)) return null;
  return minutes === 0
    ? "Nhắc đúng giờ"
    : `Nhắc trước ${reminderOptionLabel(minutes as ReminderMinutes)}`;
}

/**
 * The "remindBefore" form field: "" (no reminder) or one of REMINDER_MINUTES as a string.
 * Parses to a number or null.
 */
export const remindBeforeField = z
  .string()
  .optional()
  .transform((value) => value ?? "")
  .refine(
    (value) => value === "" || (REMINDER_MINUTES as readonly number[]).includes(Number(value)),
    "Thời gian nhắc không hợp lệ.",
  )
  .transform((value) => (value === "" ? null : (Number(value) as ReminderMinutes)));

/** Form value for a stored reminder: "" when there is none. */
export function reminderToFormValue(minutes: number | null): string {
  return minutes === null ? "" : String(minutes);
}
