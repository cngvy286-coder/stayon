/** Colours allowed by the events.color check constraint. */
export const EVENT_COLORS = ["brand", "teal", "amber", "rose", "sky"] as const;
export type EventColor = (typeof EVENT_COLORS)[number];

/** ISO weekdays: 1 = Monday (T2) ... 7 = Sunday (CN). */
export const ISO_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

/** A row of public.events as the app reads it. Times are ISO strings in UTC. */
export type CalendarEvent = {
  id: string;
  title: string;
  note: string | null;
  start_at: string;
  end_at: string;
  color: EventColor;
  /** Weekdays the event repeats on every week; null for a one-off event. */
  repeat_days: number[] | null;
  /** Last local date (YYYY-MM-DD) of a repeating series; null = forever. */
  repeat_until: string | null;
  /**
   * Set on a computed occurrence of a repeating event: the series' own first start/end.
   * start_at / end_at then hold this occurrence's times.
   */
  series?: { start_at: string; end_at: string };
};
