import { connection } from "next/server";

import { getEventsForRange, getUserTimezone } from "@/lib/data/events";
import { getTasks } from "@/lib/data/tasks";
import { REMINDER_GRACE_MS, REMINDER_HORIZON_MS, buildReminders } from "@/lib/reminders/schedule";
import { expandRecurringEvents } from "@/lib/schedule/recurrence";
import { createClient } from "@/lib/supabase/server";
import { addDays, startOfWeek, toDateKey } from "@/lib/utils/date";

/** The longest reminder offered (1 day), so events starting that much after the horizon count. */
const MAX_REMINDER_MS = 24 * 60 * 60 * 1000;

/**
 * GET /api/reminders — the signed-in user's reminders for the next 24 hours.
 * Polled by the browser (useReminders); a Route Handler because this is a read, not a mutation.
 */
export async function GET() {
  // Per-user and time-dependent: always run at request time.
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timeZone = await getUserTimezone();
  const now = new Date();
  const todayKey = toDateKey(now, timeZone);

  const [storedEvents, tasks] = await Promise.all([
    getEventsForRange(
      new Date(now.getTime() - REMINDER_GRACE_MS),
      new Date(now.getTime() + REMINDER_HORIZON_MS + MAX_REMINDER_MS),
      todayKey,
    ),
    getTasks(now),
  ]);

  // The window can cross into next week, so expand repeating series for both weeks.
  const thisWeek = startOfWeek(todayKey);
  const events = [
    ...expandRecurringEvents(storedEvents, thisWeek, timeZone),
    ...expandRecurringEvents(
      storedEvents.filter((event) => event.repeat_days),
      addDays(thisWeek, 7),
      timeZone,
    ),
  ];

  return Response.json(
    { reminders: buildReminders(events, tasks, now, timeZone) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
