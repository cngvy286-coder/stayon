import Link from "next/link";

import { EVENT_COLOR_CLASSES } from "@/components/schedule/eventColors";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Icon } from "@/components/ui/Icon";
import type { TodayEvent } from "@/lib/dashboard/summary";
import { formatMinutes } from "@/lib/utils/date";

/** "Lịch hôm nay": today's events in time order; the current one is marked, past ones fade. */
export function TodayEvents({ events }: { events: TodayEvent[] }) {
  return (
    <section aria-labelledby="today-events" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="today-events" className="font-semibold">
          Lịch hôm nay
        </h2>
        <Link href="/schedule" className="text-sm font-medium text-brand-700 hover:underline">
          Mở thời khóa biểu
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line bg-surface p-5">
          <p className="text-sm text-ink-muted">Hôm nay không có lịch nào.</p>
          <ButtonLink href="/schedule" variant="secondary">
            Thêm lịch
          </ButtonLink>
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {events.map(({ event, startMin, endMin, state }) => (
            <li
              key={event.id}
              className={`flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 ${
                state === "now" ? "border-teal-300 ring-1 ring-teal-200" : "border-line"
              } ${state === "past" ? "opacity-60" : ""}`}
            >
              <span
                aria-hidden
                className={`h-9 w-1 shrink-0 rounded-full ${EVENT_COLOR_CLASSES[event.color].dot}`}
              />
              <span className="w-24 shrink-0 text-sm text-ink-muted tabular-nums">
                {formatMinutes(startMin)} – {formatMinutes(endMin)}
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-1.5 font-medium">
                <span className="truncate">{event.title}</span>
                {event.repeat_days && (
                  <Icon name="repeat" className="size-3.5 shrink-0 text-ink-muted" />
                )}
              </span>
              {state === "now" && (
                <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800">
                  Đang diễn ra
                </span>
              )}
              {state === "past" && <span className="sr-only">(đã qua)</span>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
