import { addDays, formatDayMonth, formatMinutes, minutesOfDay, toDateKey } from "@/lib/utils/date";
import type { TaskStatus } from "@/types/task";

export type DueLabel = {
  /** "Hôm nay 17:00", "Ngày mai 09:00", "Hôm qua 08:00", "05/12 14:00", "05/01/2027 14:00". */
  text: string;
  /** Deadline has passed and the task is not done. */
  overdue: boolean;
};

/** Human-friendly deadline label in the user's timezone, relative to `now`. */
export function dueLabel(dueAt: string, status: TaskStatus, now: Date, timeZone: string): DueLabel {
  const due = new Date(dueAt);
  const dueKey = toDateKey(due, timeZone);
  const todayKey = toDateKey(now, timeZone);
  const time = formatMinutes(minutesOfDay(due, timeZone));

  let day: string;
  if (dueKey === todayKey) day = "Hôm nay";
  else if (dueKey === addDays(todayKey, 1)) day = "Ngày mai";
  else if (dueKey === addDays(todayKey, -1)) day = "Hôm qua";
  else if (dueKey.slice(0, 4) === todayKey.slice(0, 4)) day = formatDayMonth(dueKey);
  else day = `${formatDayMonth(dueKey)}/${dueKey.slice(0, 4)}`;

  return {
    text: `${day} ${time}`,
    overdue: status !== "done" && due.getTime() < now.getTime(),
  };
}
