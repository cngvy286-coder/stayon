"use server";

import { refresh } from "next/cache";

import { getUserTimezone } from "@/lib/data/events";
import { createClient } from "@/lib/supabase/server";
import { parseTimeToMinutes, zonedTimeToUtc } from "@/lib/utils/date";
import { type FieldErrors, firstFieldErrors } from "@/lib/validation/auth";
import { eventFormSchema } from "@/lib/validation/event";

export type EventFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: FieldErrors;
  /** What the user typed, so the form keeps it after an error. */
  values?: Record<string, string>;
};

const FIELDS = ["title", "date", "startTime", "endTime", "color", "note"] as const;

export async function createEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  );

  const parsed = eventFormSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors(parsed.error), values };
  }

  // getUserTimezone also verifies the user is signed in.
  const timeZone = await getUserTimezone();
  const { title, date, startTime, endTime, color, note } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({
    // user_id is filled by the database default auth.uid().
    title,
    note,
    color,
    start_at: zonedTimeToUtc(date, parseTimeToMinutes(startTime), timeZone).toISOString(),
    end_at: zonedTimeToUtc(date, parseTimeToMinutes(endTime), timeZone).toISOString(),
  });

  if (error) {
    console.error("createEvent failed:", error.code, error.message);
    return { status: "error", message: "Không lưu được lịch. Vui lòng thử lại.", values };
  }

  // Re-render the current page so the new event appears in the week view.
  refresh();
  return { status: "success" };
}
