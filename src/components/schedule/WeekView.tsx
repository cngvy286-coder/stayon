import { getEventsBetween, getUserTimezone } from "@/lib/data/events";
import { buildWeekLayout } from "@/lib/schedule/weekLayout";
import { addDays, isDateKey, startOfDayInZone, startOfWeek, toDateKey } from "@/lib/utils/date";

import { WeekAgenda } from "./WeekAgenda";
import { WeekGrid } from "./WeekGrid";
import { WeekNav } from "./WeekNav";

type WeekViewProps = {
  /** ?week=YYYY-MM-DD from the URL (any day of the wanted week). */
  week: string | string[] | undefined;
};

/** Loads the user's events for one week and renders them (grid on desktop, list on mobile). */
export async function WeekView({ week }: WeekViewProps) {
  const timeZone = await getUserTimezone();
  const todayKey = toDateKey(new Date(), timeZone);
  const requested = typeof week === "string" && isDateKey(week) ? week : todayKey;
  const weekStart = startOfWeek(requested);

  const events = await getEventsBetween(
    startOfDayInZone(weekStart, timeZone),
    startOfDayInZone(addDays(weekStart, 7), timeZone),
  );
  const layout = buildWeekLayout(events, weekStart, timeZone);

  return (
    <div className="flex flex-col gap-4">
      <WeekNav weekStart={weekStart} isCurrentWeek={weekStart === startOfWeek(todayKey)} />

      {events.length === 0 && (
        <p className="rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-4 py-3 text-sm text-brand-700">
          Tuần này chưa có lịch nào.
        </p>
      )}

      <div className="hidden md:block">
        <WeekGrid layout={layout} todayKey={todayKey} />
      </div>
      <div className="md:hidden">
        <WeekAgenda layout={layout} todayKey={todayKey} />
      </div>
    </div>
  );
}
