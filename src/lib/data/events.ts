import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TIMEZONE, isValidTimeZone } from "@/lib/utils/date";
import type { CalendarEvent } from "@/types/event";

/**
 * Data access for the timetable. Server-only: every call verifies the user,
 * and RLS in the database limits rows to that user.
 */

const EVENT_COLUMNS =
  "id, title, note, start_at, end_at, color, repeat_days, repeat_until, remind_before_minutes";

/** Verify the signed-in user (JWT signature checked) or send them to /login. */
export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");
  return { supabase, userId };
}

/** The user's IANA timezone from their profile, falling back to Vietnam time. */
export async function getUserTimezone(): Promise<string> {
  const { supabase, userId } = await requireUser();
  const { data } = await supabase.from("profiles").select("timezone").eq("id", userId).single();
  const timeZone = (data as { timezone?: string } | null)?.timezone;
  return timeZone && isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIMEZONE;
}

/**
 * Events that may appear in [from, to):
 * - one-off events overlapping the range, and
 * - repeating series that started before `to` and have not ended before `fromDate`.
 * Repeating series are returned as stored; expand them with expandRecurringEvents.
 */
export async function getEventsForRange(
  from: Date,
  to: Date,
  fromDate: string,
): Promise<CalendarEvent[]> {
  const { supabase } = await requireUser();

  const [oneOff, repeating] = await Promise.all([
    supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .is("repeat_days", null)
      .lt("start_at", to.toISOString())
      .gt("end_at", from.toISOString())
      .order("start_at"),
    supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .not("repeat_days", "is", null)
      .lt("start_at", to.toISOString())
      .or(`repeat_until.is.null,repeat_until.gte.${fromDate}`)
      .order("start_at"),
  ]);

  const error = oneOff.error ?? repeating.error;
  if (error) {
    throw new Error(`Could not load events: ${error.message}`);
  }
  return [...(oneOff.data ?? []), ...(repeating.data ?? [])] as CalendarEvent[];
}
