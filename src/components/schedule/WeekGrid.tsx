import type { WeekLayout } from "@/lib/schedule/weekLayout";
import { formatDayMonth, formatMinutes, weekdayLabel } from "@/lib/utils/date";

import { Icon } from "@/components/ui/Icon";

import { EditableEvent } from "./EditableEvent";
import { EVENT_COLOR_CLASSES } from "./eventColors";

type WeekGridProps = { layout: WeekLayout; todayKey: string; timeZone: string };

const HOUR_HEIGHT_REM = 3;

/**
 * Desktop week view: 7 day columns on an hour grid.
 * Event blocks are positioned with inline top/height/left/width because those values
 * are computed per event; everything else is styled with Tailwind classes.
 */
export function WeekGrid({ layout, todayKey, timeZone }: WeekGridProps) {
  const { startHour, endHour, days } = layout;
  const totalMinutes = (endHour - startHour) * 60;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      {/* Day headers */}
      <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] border-b border-line">
        <div />
        {days.map((day) => {
          const isToday = day.key === todayKey;
          return (
            <div
              key={day.key}
              className="flex flex-col items-center gap-0.5 border-l border-line py-2.5"
            >
              <span
                className={`text-xs font-medium ${isToday ? "text-brand-700" : "text-ink-muted"}`}
              >
                {weekdayLabel(day.key)}
              </span>
              <span
                className={`grid h-8 min-w-8 place-items-center rounded-full px-1.5 text-sm font-semibold tabular-nums ${
                  isToday ? "bg-brand-600 text-white" : ""
                }`}
              >
                {formatDayMonth(day.key)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hour grid */}
      <div
        className="relative grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]"
        style={{ height: `${hours.length * HOUR_HEIGHT_REM}rem` }}
      >
        <div className="relative">
          {hours.map((hour, i) => (
            <span
              key={hour}
              className="absolute right-2 -translate-y-1/2 text-xs text-ink-muted tabular-nums"
              style={{ top: `${(i / hours.length) * 100}%` }}
            >
              {i === 0 ? "" : formatMinutes(hour * 60)}
            </span>
          ))}
        </div>

        {days.map((day) => (
          <div
            key={day.key}
            className={`relative border-l border-line ${day.key === todayKey ? "bg-brand-50/40" : ""}`}
          >
            {hours.slice(1).map((hour, i) => (
              <div
                key={hour}
                className="absolute inset-x-0 border-t border-line/70"
                style={{ top: `${((i + 1) / hours.length) * 100}%` }}
              />
            ))}

            {day.segments.map((segment) => {
              const top = ((segment.startMin - startHour * 60) / totalMinutes) * 100;
              const height = ((segment.endMin - segment.startMin) / totalMinutes) * 100;
              const colors = EVENT_COLOR_CLASSES[segment.event.color];
              const time = `${formatMinutes(segment.startMin)} – ${formatMinutes(segment.endMin)}`;

              return (
                <EditableEvent
                  key={segment.event.id}
                  event={segment.event}
                  timeZone={timeZone}
                  label={`Sửa lịch: ${segment.event.title}, ${time}`}
                  className={`absolute flex flex-col justify-start overflow-hidden rounded-lg border-l-4 px-2 py-1 text-xs leading-tight shadow-sm ${colors.block}`}
                  style={{
                    top: `${top}%`,
                    height: `max(${height}%, 1.5rem)`,
                    left: `calc(${(segment.lane / segment.lanes) * 100}% + 2px)`,
                    width: `calc(${100 / segment.lanes}% - 4px)`,
                  }}
                >
                  <span className="flex w-full items-center gap-1 font-semibold">
                    <span className="truncate">{segment.event.title}</span>
                    {segment.event.repeat_days && (
                      <Icon name="repeat" className="size-3 shrink-0 opacity-70" />
                    )}
                  </span>
                  <span className="block w-full truncate tabular-nums opacity-80">{time}</span>
                </EditableEvent>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
