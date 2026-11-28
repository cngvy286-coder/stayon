import { addDays, startOfDayInZone } from "@/lib/utils/date";
import type { CalendarEvent } from "@/types/event";

/** One event's piece inside a single day column. */
export type DaySegment = {
  event: CalendarEvent;
  /** Minutes since local midnight. */
  startMin: number;
  endMin: number;
  /** Side-by-side placement when events overlap: column `lane` of `lanes`. */
  lane: number;
  lanes: number;
  /** The event started on an earlier day / continues into the next day. */
  continuesBefore: boolean;
  continuesAfter: boolean;
};

export type WeekDay = { key: string; segments: DaySegment[] };

export type WeekLayout = {
  days: WeekDay[];
  /** Visible hour range of the grid (always covers 07:00–22:00 and every event). */
  startHour: number;
  endHour: number;
};

const MINUTE_MS = 60 * 1000;
const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 22;

/** Assign lanes so overlapping segments sit side by side. Mutates and returns `segments`. */
export function assignLanes(segments: DaySegment[]): DaySegment[] {
  const sorted = [...segments].sort(
    (a, b) => a.startMin - b.startMin || b.endMin - b.startMin - (a.endMin - a.startMin),
  );

  let cluster: DaySegment[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -1;

  const closeCluster = () => {
    cluster.forEach((segment) => (segment.lanes = laneEnds.length));
    cluster = [];
    laneEnds = [];
  };

  for (const segment of sorted) {
    if (segment.startMin >= clusterEnd) closeCluster();

    const free = laneEnds.findIndex((end) => end <= segment.startMin);
    segment.lane = free === -1 ? laneEnds.length : free;
    laneEnds[segment.lane] = segment.endMin;

    cluster.push(segment);
    clusterEnd = Math.max(clusterEnd, segment.endMin);
  }
  closeCluster();

  return sorted;
}

/**
 * Split events into the 7 day columns of the week starting on `weekStart` (a Monday date key),
 * using `timeZone` to decide which day and time each piece falls on.
 */
export function buildWeekLayout(
  events: CalendarEvent[],
  weekStart: string,
  timeZone: string,
): WeekLayout {
  let earliest = DEFAULT_START_HOUR * 60;
  let latest = DEFAULT_END_HOUR * 60;

  const days = Array.from({ length: 7 }, (_, index): WeekDay => {
    const key = addDays(weekStart, index);
    const dayStart = startOfDayInZone(key, timeZone).getTime();
    const dayEnd = startOfDayInZone(addDays(key, 1), timeZone).getTime();

    const segments: DaySegment[] = [];
    for (const event of events) {
      const start = new Date(event.start_at).getTime();
      const end = new Date(event.end_at).getTime();
      if (end <= dayStart || start >= dayEnd) continue;

      const startMin = Math.round((Math.max(start, dayStart) - dayStart) / MINUTE_MS);
      const endMin = Math.round((Math.min(end, dayEnd) - dayStart) / MINUTE_MS);
      earliest = Math.min(earliest, startMin);
      latest = Math.max(latest, endMin);

      segments.push({
        event,
        startMin,
        endMin,
        lane: 0,
        lanes: 1,
        continuesBefore: start < dayStart,
        continuesAfter: end > dayEnd,
      });
    }

    return { key, segments: assignLanes(segments) };
  });

  return {
    days,
    startHour: Math.max(0, Math.floor(earliest / 60)),
    endHour: Math.min(24, Math.ceil(latest / 60)),
  };
}
