import { connection } from "next/server";

import { getEventsForRange, getUserTimezone } from "@/lib/data/events";
import { expandRecurringEvents } from "@/lib/schedule/recurrence";
import { buildWeekLayout } from "@/lib/schedule/weekLayout";
import { addDays, isDateKey, startOfDayInZone, startOfWeek, toDateKey } from "@/lib/utils/date";

import { AddEventButton } from "./AddEventButton";
import { WeekAgenda } from "./WeekAgenda";
import { WeekGrid } from "./WeekGrid";
import { WeekNav } from "./WeekNav";

type WeekViewProps = {
  /** ?week=YYYY-MM-DD from the URL (any day of the wanted week). */
  week: string | string[] | undefined;
};

/** Loads the user's events for one week and renders them (grid on desktop, list on mobile). */
export async function WeekView({ week }: WeekViewProps) {
  // Everything below depends on the current time and the signed-in user (Supabase checks token
  // expiry with Date.now()), so never prerender it — not even during Partial Prefetching.
  await connection();
  const timeZone = await getUserTimezone();
  const todayKey = toDateKey(new Date(), timeZone);
  const requested = typeof week === "string" && isDateKey(week) ? week : todayKey;
  const weekStart = startOfWeek(requested);

  const stored = await getEventsForRange(
    startOfDayInZone(weekStart, timeZone),
    startOfDayInZone(addDays(weekStart, 7), timeZone),
    weekStart,
  );
  // Repeating series become one event per occurrence in this week.
  const events = expandRecurringEvents(stored, weekStart, timeZone);
  const layout = buildWeekLayout(events, weekStart, timeZone);
  const isCurrentWeek = weekStart === startOfWeek(todayKey);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <WeekNav weekStart={weekStart} isCurrentWeek={isCurrentWeek} />
        </div>
        {/* New events default to today, or to Monday when viewing another week. */}
        <AddEventButton defaultDate={isCurrentWeek ? todayKey : weekStart} />
      </div>

      {events.length === 0 && (
        <p className="rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-4 py-3 text-sm text-brand-700">
          Tuần này chưa có lịch nào.
        </p>
      )}

      <div className="hidden md:block">
        <WeekGrid layout={layout} todayKey={todayKey} timeZone={timeZone} />
      </div>
      <div className="md:hidden">
        <WeekAgenda layout={layout} todayKey={todayKey} timeZone={timeZone} />
      </div>
    </div>
  );
}
