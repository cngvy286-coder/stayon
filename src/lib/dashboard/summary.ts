import { addDays, minutesOfDay, startOfDayInZone, startOfWeek, toDateKey } from "@/lib/utils/date";
import type { CalendarEvent } from "@/types/event";
import type { Task } from "@/types/task";

/** How many tasks the "Việc cần làm hôm nay" list shows. */
export const TODAY_TASKS_LIMIT = 5;

export type TodayEvent = {
  event: CalendarEvent;
  /** Minutes since local midnight, clipped to today. */
  startMin: number;
  endMin: number;
  state: "past" | "now" | "upcoming";
};

export type DashboardSummary = {
  todayKey: string;
  /** Tasks due this week (Mon–Sun) or completed this week. percent is null when there are none. */
  week: { done: number; total: number; percent: number | null };
  /** Open tasks that are overdue or due today, soonest first (first TODAY_TASKS_LIMIT). */
  todayTasks: Task[];
  /** Total open tasks that are overdue or due today (the list above may be cut off). */
  todayTasksTotal: number;
  /** Open tasks due today (including those already past their time). */
  dueTodayCount: number;
  /** Open tasks whose deadline has passed. */
  overdueCount: number;
  /** Today's events (occurrences already expanded), in time order. */
  todayEvents: TodayEvent[];
  nextEvent: TodayEvent | null;
};

const MINUTE_MS = 60 * 1000;

/** Everything the dashboard shows, computed from the user's tasks and events. */
export function buildDashboardSummary(
  tasks: Task[],
  events: CalendarEvent[],
  now: Date,
  timeZone: string,
): DashboardSummary {
  const todayKey = toDateKey(now, timeZone);
  const weekStart = startOfWeek(todayKey);
  const weekEnd = addDays(weekStart, 7);
  // Date keys are YYYY-MM-DD, so string comparison matches date order.
  const inThisWeek = (iso: string | null) => {
    if (!iso) return false;
    const key = toDateKey(new Date(iso), timeZone);
    return key >= weekStart && key < weekEnd;
  };

  // Weekly progress.
  const weekTasks = tasks.filter(
    (task) => inThisWeek(task.due_at) || (task.status === "done" && inThisWeek(task.completed_at)),
  );
  const weekDone = weekTasks.filter((task) => task.status === "done").length;

  // Today's open tasks.
  const open = tasks.filter((task) => task.status !== "done" && task.due_at);
  const dueKey = (task: Task) => toDateKey(new Date(task.due_at!), timeZone);
  const todayOrOverdue = open
    .filter((task) => dueKey(task) <= todayKey)
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime());

  // Today's events, clipped to today.
  const dayStart = startOfDayInZone(todayKey, timeZone).getTime();
  const dayEnd = startOfDayInZone(addDays(todayKey, 1), timeZone).getTime();
  const nowMs = now.getTime();
  const todayEvents: TodayEvent[] = events
    .filter(
      (event) =>
        new Date(event.start_at).getTime() < dayEnd && new Date(event.end_at).getTime() > dayStart,
    )
    .map((event) => {
      const start = Math.max(new Date(event.start_at).getTime(), dayStart);
      const end = Math.min(new Date(event.end_at).getTime(), dayEnd);
      return {
        event,
        startMin: minutesOfDay(new Date(start), timeZone),
        endMin: Math.round((end - dayStart) / MINUTE_MS),
        state: end <= nowMs ? "past" : start <= nowMs ? "now" : "upcoming",
      } satisfies TodayEvent;
    })
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  return {
    todayKey,
    week: {
      done: weekDone,
      total: weekTasks.length,
      percent: weekTasks.length === 0 ? null : Math.round((weekDone / weekTasks.length) * 100),
    },
    todayTasks: todayOrOverdue.slice(0, TODAY_TASKS_LIMIT),
    todayTasksTotal: todayOrOverdue.length,
    dueTodayCount: open.filter((task) => dueKey(task) === todayKey).length,
    overdueCount: open.filter((task) => new Date(task.due_at!).getTime() < nowMs).length,
    todayEvents,
    nextEvent: todayEvents.find((item) => item.state === "upcoming") ?? null,
  };
}
