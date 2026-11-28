import { connection } from "next/server";

import { buildDashboardSummary } from "@/lib/dashboard/summary";
import { getEventsForRange, getUserTimezone } from "@/lib/data/events";
import { getDisplayName } from "@/lib/data/profile";
import { getTasks } from "@/lib/data/tasks";
import { expandRecurringEvents } from "@/lib/schedule/recurrence";
import {
  addDays,
  formatLongDate,
  formatMinutes,
  greetingFor,
  startOfDayInZone,
  startOfWeek,
  toDateKey,
} from "@/lib/utils/date";

import { ProgressBar } from "./ProgressBar";
import { StatTile } from "./StatTile";
import { TodayEvents } from "./TodayEvents";
import { TodayTasks } from "./TodayTasks";

/** Loads today's tasks and events and renders the dashboard. */
export async function DashboardView() {
  // Everything below depends on the current time and the signed-in user, so never prerender it.
  await connection();
  const timeZone = await getUserTimezone();
  const now = new Date();
  const todayKey = toDateKey(now, timeZone);

  const [displayName, tasks, storedEvents] = await Promise.all([
    getDisplayName(),
    getTasks(now),
    getEventsForRange(
      startOfDayInZone(todayKey, timeZone),
      startOfDayInZone(addDays(todayKey, 1), timeZone),
      todayKey,
    ),
  ]);
  // Repeating series become this week's occurrences; the summary keeps only today's.
  const events = expandRecurringEvents(storedEvents, startOfWeek(todayKey), timeZone);
  const summary = buildDashboardSummary(tasks, events, now, timeZone);
  const { week, nextEvent } = summary;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greetingFor(now, timeZone)}
          {displayName ? `, ${displayName}` : ""}!
        </h1>
        <p className="mt-1 text-ink-muted">{formatLongDate(todayKey)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Tiến độ tuần này"
          icon="check"
          tone="bg-brand-50 text-brand-600"
          value={week.percent === null ? "—" : `${week.percent}%`}
          detail={
            week.total === 0 ? "Chưa có việc trong tuần" : `Xong ${week.done} / ${week.total} việc`
          }
        >
          {week.percent !== null && (
            <ProgressBar percent={week.percent} label="Tiến độ công việc tuần này" />
          )}
        </StatTile>

        <StatTile
          label="Việc hôm nay"
          icon="bell"
          tone="bg-amber-50 text-amber-600"
          value={`${summary.dueTodayCount} việc`}
          detail={
            summary.overdueCount > 0 ? (
              <span className="font-semibold text-rose-700">
                {summary.overdueCount} việc quá hạn
              </span>
            ) : (
              "Không có việc quá hạn"
            )
          }
        />

        <StatTile
          label="Lịch hôm nay"
          icon="calendar"
          tone="bg-teal-50 text-teal-600"
          value={`${summary.todayEvents.length} buổi`}
          detail={
            nextEvent
              ? `Tiếp theo: ${nextEvent.event.title} lúc ${formatMinutes(nextEvent.startMin)}`
              : summary.todayEvents.length > 0
                ? "Không còn lịch nào sau giờ này"
                : "Hôm nay không có lịch"
          }
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <TodayTasks
          tasks={summary.todayTasks}
          total={summary.todayTasksTotal}
          now={now}
          timeZone={timeZone}
        />
        <TodayEvents events={summary.todayEvents} />
      </div>
    </div>
  );
}
