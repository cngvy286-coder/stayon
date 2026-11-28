"use server";

import { refresh } from "next/cache";

import { getUserTimezone } from "@/lib/data/events";
import { createClient } from "@/lib/supabase/server";
import { parseTimeToMinutes, zonedTimeToUtc } from "@/lib/utils/date";
import { type FieldErrors, firstFieldErrors } from "@/lib/validation/auth";
import { eventFormSchema, eventIdSchema } from "@/lib/validation/event";

export type EventFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: FieldErrors;
  /** What the user typed, so the form keeps it after an error. */
  values?: Record<string, string>;
};

export type DeleteEventResult = { ok: true } | { ok: false; message: string };

const FIELDS = ["title", "date", "startTime", "endTime", "color", "note"] as const;
const NOT_FOUND = "Không tìm thấy lịch này. Có thể lịch đã bị xóa.";

/**
 * Validate the event form and turn it into a database row.
 * Dates/times are read in the user's timezone (which also verifies the user is signed in).
 */
async function readEventForm(formData: FormData) {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  );

  const parsed = eventFormSchema.safeParse(values);
  if (!parsed.success) {
    const state: EventFormState = {
      status: "error",
      fieldErrors: firstFieldErrors(parsed.error),
      values,
    };
    return { ok: false as const, state };
  }

  const timeZone = await getUserTimezone();
  const { title, date, startTime, endTime, color, note } = parsed.data;
  const row = {
    title,
    note,
    color,
    start_at: zonedTimeToUtc(date, parseTimeToMinutes(startTime), timeZone).toISOString(),
    end_at: zonedTimeToUtc(date, parseTimeToMinutes(endTime), timeZone).toISOString(),
  };
  return { ok: true as const, row, values };
}

export async function createEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const form = await readEventForm(formData);
  if (!form.ok) return form.state;

  const supabase = await createClient();
  // user_id is filled by the database default auth.uid().
  const { error } = await supabase.from("events").insert(form.row);

  if (error) {
    console.error("createEvent failed:", error.code, error.message);
    return {
      status: "error",
      message: "Không lưu được lịch. Vui lòng thử lại.",
      values: form.values,
    };
  }

  // Re-render the current page so the new event appears in the week view.
  refresh();
  return { status: "success" };
}

/** Bound with the event id on the client: updateEvent.bind(null, id). */
export async function updateEvent(
  id: string,
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  if (!eventIdSchema.safeParse(id).success) {
    return { status: "error", message: NOT_FOUND };
  }

  const form = await readEventForm(formData);
  if (!form.ok) return form.state;

  const supabase = await createClient();
  // RLS only lets users update their own rows; anything else updates nothing.
  const { data, error } = await supabase.from("events").update(form.row).eq("id", id).select("id");

  if (error) {
    console.error("updateEvent failed:", error.code, error.message);
    return {
      status: "error",
      message: "Không lưu được thay đổi. Vui lòng thử lại.",
      values: form.values,
    };
  }
  if (!data || data.length === 0) {
    return { status: "error", message: NOT_FOUND, values: form.values };
  }

  refresh();
  return { status: "success" };
}

export async function deleteEvent(id: string): Promise<DeleteEventResult> {
  if (!eventIdSchema.safeParse(id).success) {
    return { ok: false, message: NOT_FOUND };
  }

  // Verifies the user is signed in before touching the database.
  await getUserTimezone();

  const supabase = await createClient();
  const { data, error } = await supabase.from("events").delete().eq("id", id).select("id");

  if (error) {
    console.error("deleteEvent failed:", error.code, error.message);
    return { ok: false, message: "Không xóa được lịch. Vui lòng thử lại." };
  }
  if (!data || data.length === 0) {
    return { ok: false, message: NOT_FOUND };
  }

  refresh();
  return { ok: true };
}
