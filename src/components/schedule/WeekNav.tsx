import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { addDays, formatWeekRange } from "@/lib/utils/date";

const navButton =
  "inline-flex h-9 items-center justify-center rounded-lg border border-line bg-surface px-3 text-sm font-medium text-ink-muted transition-colors hover:border-brand-300 hover:text-brand-700";

export function WeekNav({
  weekStart,
  isCurrentWeek,
}: {
  weekStart: string;
  isCurrentWeek: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="mr-auto text-lg font-semibold tabular-nums">{formatWeekRange(weekStart)}</p>
      {!isCurrentWeek && (
        <Link href="/schedule" className={navButton}>
          Tuần này
        </Link>
      )}
      <Link
        href={`/schedule?week=${addDays(weekStart, -7)}`}
        className={navButton}
        aria-label="Tuần trước"
      >
        <Icon name="arrowRight" className="size-4 rotate-180" />
      </Link>
      <Link
        href={`/schedule?week=${addDays(weekStart, 7)}`}
        className={navButton}
        aria-label="Tuần sau"
      >
        <Icon name="arrowRight" className="size-4" />
      </Link>
    </div>
  );
}
