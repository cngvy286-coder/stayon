import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TIMEZONE, isValidTimeZone } from "@/lib/utils/date";
import type { CalendarEvent } from "@/types/event";

/**
 * Data access for the timetable. Server-only: every call verifies the user,
 * and RLS in the database limits rows to that user.
 */

async function requireUser() {
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

/** Events that overlap [from, to), oldest first. */
export async function getEventsBetween(from: Date, to: Date): Promise<CalendarEvent[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, note, start_at, end_at, color")
    .lt("start_at", to.toISOString())
    .gt("end_at", from.toISOString())
    .order("start_at");

  if (error) {
    throw new Error(`Could not load events: ${error.message}`);
  }
  return (data ?? []) as CalendarEvent[];
}
