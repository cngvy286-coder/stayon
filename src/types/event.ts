/** Colours allowed by the events.color check constraint. */
export const EVENT_COLORS = ["brand", "teal", "amber", "rose", "sky"] as const;
export type EventColor = (typeof EVENT_COLORS)[number];

/** A row of public.events as the app reads it. Times are ISO strings in UTC. */
export type CalendarEvent = {
  id: string;
  title: string;
  note: string | null;
  start_at: string;
  end_at: string;
  color: EventColor;
};
