"use server";

import { refresh } from "next/cache";

import { getUserTimezone } from "@/lib/data/events";
import { createClient } from "@/lib/supabase/server";
import { parseTimeToMinutes, zonedTimeToUtc } from "@/lib/utils/date";
import { type FieldErrors, firstFieldErrors } from "@/lib/validation/auth";
import { taskFormSchema, taskIdSchema, taskStatusSchema } from "@/lib/validation/task";
import type { TaskStatus } from "@/types/task";

export type TaskFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: FieldErrors;
  /** What the user typed, so the form keeps it after an error. */
  values?: Record<string, string>;
};

export type TaskActionResult = { ok: true } | { ok: false; message: string };

const FIELDS = ["title", "note", "dueDate", "dueTime", "priority", "remindBefore"] as const;
const NOT_FOUND = "Không tìm thấy việc này. Có thể việc đã bị xóa.";

/**
 * Validate the task form and turn it into a database row.
 * The deadline is read in the user's timezone (which also verifies the user is signed in).
 */
async function readTaskForm(formData: FormData) {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  );

  const parsed = taskFormSchema.safeParse(values);
  if (!parsed.success) {
    const state: TaskFormState = {
      status: "error",
      fieldErrors: firstFieldErrors(parsed.error),
      values,
    };
    return { ok: false as const, state };
  }

  const timeZone = await getUserTimezone();
  const { title, note, priority, due, remindBefore } = parsed.data;
  const row = {
    title,
    note,
    priority,
    remind_before_minutes: remindBefore,
    due_at: due
      ? zonedTimeToUtc(due.date, parseTimeToMinutes(due.time), timeZone).toISOString()
      : null,
  };
  return { ok: true as const, row, values };
}

export async function createTask(_prev: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const form = await readTaskForm(formData);
  if (!form.ok) return form.state;

  const supabase = await createClient();
  // user_id, status ('todo') and timestamps come from database defaults.
  const { error } = await supabase.from("tasks").insert(form.row);

  if (error) {
    console.error("createTask failed:", error.code, error.message);
    return {
      status: "error",
      message: "Không lưu được việc. Vui lòng thử lại.",
      values: form.values,
    };
  }

  // Re-render /tasks so the new task appears.
  refresh();
  return { status: "success" };
}

/** Bound with the task id on the client: updateTask.bind(null, id). */
export async function updateTask(
  id: string,
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  if (!taskIdSchema.safeParse(id).success) {
    return { status: "error", message: NOT_FOUND };
  }

  const form = await readTaskForm(formData);
  if (!form.ok) return form.state;

  const supabase = await createClient();
  // RLS only lets users update their own rows; anything else updates nothing.
  const { data, error } = await supabase.from("tasks").update(form.row).eq("id", id).select("id");

  if (error) {
    console.error("updateTask failed:", error.code, error.message);
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

/** Move a task to another status. completed_at is maintained by a database trigger. */
export async function setTaskStatus(id: string, status: TaskStatus): Promise<TaskActionResult> {
  if (!taskIdSchema.safeParse(id).success || !taskStatusSchema.safeParse(status).success) {
    return { ok: false, message: NOT_FOUND };
  }

  // Verifies the user is signed in before touching the database.
  await getUserTimezone();

  const supabase = await createClient();
  const { data, error } = await supabase.from("tasks").update({ status }).eq("id", id).select("id");

  if (error) {
    console.error("setTaskStatus failed:", error.code, error.message);
    return { ok: false, message: "Không đổi được trạng thái. Vui lòng thử lại." };
  }
  if (!data || data.length === 0) {
    return { ok: false, message: NOT_FOUND };
  }

  refresh();
  return { ok: true };
}

export async function deleteTask(id: string): Promise<TaskActionResult> {
  if (!taskIdSchema.safeParse(id).success) {
    return { ok: false, message: NOT_FOUND };
  }

  // Verifies the user is signed in before touching the database.
  await getUserTimezone();

  const supabase = await createClient();
  const { data, error } = await supabase.from("tasks").delete().eq("id", id).select("id");

  if (error) {
    console.error("deleteTask failed:", error.code, error.message);
    return { ok: false, message: "Không xóa được việc. Vui lòng thử lại." };
  }
  if (!data || data.length === 0) {
    return { ok: false, message: NOT_FOUND };
  }

  refresh();
  return { ok: true };
}
