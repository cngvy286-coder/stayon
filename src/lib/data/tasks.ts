import type { Task } from "@/types/task";

import { requireUser } from "./events";

const TASK_COLUMNS =
  "id, title, note, due_at, status, priority, completed_at, created_at, remind_before_minutes";
const DONE_VISIBLE_DAYS = 7;

/**
 * The user's open tasks plus tasks completed in the last 7 days (older done tasks are hidden
 * so the list stays short). Server-only; RLS limits rows to the signed-in user.
 */
export async function getTasks(now: Date): Promise<Task[]> {
  const { supabase } = await requireUser();
  const doneSince = new Date(now.getTime() - DONE_VISIBLE_DAYS * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .or(`status.neq.done,completed_at.gte.${doneSince.toISOString()}`);

  if (error) {
    throw new Error(`Could not load tasks: ${error.message}`);
  }
  return (data ?? []) as Task[];
}
