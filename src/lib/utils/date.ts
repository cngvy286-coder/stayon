/**
 * Timezone-aware date helpers built on Intl (no extra library).
 *
 * A "date key" is a calendar date written as "YYYY-MM-DD" with no time and no zone.
 * Calendar maths (add days, find Monday) is done on date keys; converting to and from
 * real instants always goes through an IANA timezone such as "Asia/Ho_Chi_Minh".
 */

export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Read the parts of an instant as seen on a wall clock in `timeZone`. */
function zonedParts(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** Offset of `timeZone` from UTC at `instant`, in milliseconds (e.g. +7h for Vietnam). */
export function timezoneOffsetMs(instant: Date, timeZone: string): number {
  const p = zonedParts(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Is `value` a real calendar date in "YYYY-MM-DD" form? */
export function isDateKey(value: string): boolean {
  if (!DATE_KEY.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** The calendar date of `instant` in `timeZone`. */
export function toDateKey(instant: Date, timeZone: string): string {
  const p = zonedParts(instant, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Minutes since local midnight of `instant` in `timeZone` (0–1439). */
export function minutesOfDay(instant: Date, timeZone: string): number {
  const p = zonedParts(instant, timeZone);
  return p.hour * 60 + p.minute;
}

function keyToUtcDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(key: string, days: number): string {
  return new Date(keyToUtcDate(key).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/** Monday of the week that contains `key` (weeks start on Monday in Vietnam). */
export function startOfWeek(key: string): string {
  const weekday = keyToUtcDate(key).getUTCDay(); // 0 = Sunday
  return addDays(key, weekday === 0 ? -6 : 1 - weekday);
}

/** The instant shown as `minutes` after midnight on `key` by a wall clock in `timeZone`. */
export function zonedTimeToUtc(key: string, minutes: number, timeZone: string): Date {
  const guess = keyToUtcDate(key).getTime() + minutes * 60 * 1000;
  // Two passes so the result is right even on days when the offset changes (DST).
  const first = guess - timezoneOffsetMs(new Date(guess), timeZone);
  return new Date(guess - timezoneOffsetMs(new Date(first), timeZone));
}

/** The instant when `key` starts (local midnight) in `timeZone`. */
export function startOfDayInZone(key: string, timeZone: string): Date {
  return zonedTimeToUtc(key, 0, timeZone);
}

/** "07:30" -> 450 minutes since midnight. Assumes a valid HH:mm string. */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** Short Vietnamese weekday label: "T2" … "T7", "CN". */
export function weekdayLabel(key: string): string {
  return WEEKDAY_LABELS[keyToUtcDate(key).getUTCDay()];
}

/** "28/11" */
export function formatDayMonth(key: string): string {
  const [, m, d] = key.split("-");
  return `${d}/${m}`;
}

/** "23/11 – 29/11/2026", or across years "29/12/2026 – 04/01/2027". */
export function formatWeekRange(weekStart: string): string {
  const weekEnd = addDays(weekStart, 6);
  const [startYear] = weekStart.split("-");
  const [endYear] = weekEnd.split("-");
  const end = `${formatDayMonth(weekEnd)}/${endYear}`;
  return startYear === endYear
    ? `${formatDayMonth(weekStart)} – ${end}`
    : `${formatDayMonth(weekStart)}/${startYear} – ${end}`;
}

/** "07:30" for minutes since midnight. */
export function formatMinutes(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}
