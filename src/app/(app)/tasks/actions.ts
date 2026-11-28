"use server";

import { refresh } from "next/cache";

import { getUserTimezone } from "@/lib/data/events";
import { createClient } from "@/lib/supabase/server";
import { parseTimeToMinutes, zonedTimeToUtc } from "@/lib/utils/date";
import { type FieldErrors, firstFieldErrors } from "@/lib/validation/auth";
import { taskFormSchema } from "@/lib/validation/task";

export type TaskFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: FieldErrors;
  /** What the user typed, so the form keeps it after an error. */
  values?: Record<string, string>;
};

const FIELDS = ["title", "note", "dueDate", "dueTime", "priority"] as const;

export async function createTask(_prev: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  );

  const parsed = taskFormSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors(parsed.error), values };
  }

  // getUserTimezone also verifies the user is signed in.
  const timeZone = await getUserTimezone();
  const { title, note, priority, due } = parsed.data;

  const supabase = await createClient();
  // user_id, status ('todo') and timestamps come from database defaults.
  const { error } = await supabase.from("tasks").insert({
    title,
    note,
    priority,
    due_at: due
      ? zonedTimeToUtc(due.date, parseTimeToMinutes(due.time), timeZone).toISOString()
      : null,
  });

  if (error) {
    console.error("createTask failed:", error.code, error.message);
    return { status: "error", message: "Không lưu được việc. Vui lòng thử lại.", values };
  }

  // Re-render /tasks so the new task appears.
  refresh();
  return { status: "success" };
}
