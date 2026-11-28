import type { WeekLayout } from "@/lib/schedule/weekLayout";
import { formatDayMonth, formatMinutes, weekdayLabel } from "@/lib/utils/date";

import { EVENT_COLOR_CLASSES } from "./eventColors";

/** Mobile week view: a list of days, each with its events in time order. */
export function WeekAgenda({ layout, todayKey }: { layout: WeekLayout; todayKey: string }) {
  return (
    <ol className="flex flex-col gap-3">
      {layout.days.map((day) => {
        const isToday = day.key === todayKey;
        const segments = [...day.segments].sort((a, b) => a.startMin - b.startMin);

        return (
          <li
            key={day.key}
            className={`rounded-2xl border bg-surface p-4 ${isToday ? "border-brand-300" : "border-line"}`}
          >
            <p className="flex items-baseline gap-2 font-semibold">
              {weekdayLabel(day.key)}
              <span className="text-sm text-ink-muted tabular-nums">{formatDayMonth(day.key)}</span>
              {isToday && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                  Hôm nay
                </span>
              )}
            </p>

            {segments.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">Không có lịch</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {segments.map((segment) => (
                  <li key={segment.event.id} className="flex items-center gap-3 text-sm">
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${EVENT_COLOR_CLASSES[segment.event.color].dot}`}
                    />
                    <span className="w-24 shrink-0 text-ink-muted tabular-nums">
                      {formatMinutes(segment.startMin)} – {formatMinutes(segment.endMin)}
                    </span>
                    <span className="min-w-0 truncate font-medium">{segment.event.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
