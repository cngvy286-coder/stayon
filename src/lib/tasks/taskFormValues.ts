import { formatMinutes, minutesOfDay, toDateKey } from "@/lib/utils/date";
import type { Task, TaskPriority } from "@/types/task";

/** Values of the task form, as strings the way the inputs hold them. */
export type TaskFormValues = {
  title: string;
  note: string;
  /** "YYYY-MM-DD" or "" when there is no deadline. */
  dueDate: string;
  /** "HH:mm" or "". */
  dueTime: string;
  priority: TaskPriority;
};

/** Turn a stored task (deadline in UTC) into the edit form's values in the user's timezone. */
export function taskToFormValues(task: Task, timeZone: string): TaskFormValues {
  const due = task.due_at ? new Date(task.due_at) : null;
  return {
    title: task.title,
    note: task.note ?? "",
    dueDate: due ? toDateKey(due, timeZone) : "",
    dueTime: due ? formatMinutes(minutesOfDay(due, timeZone)) : "",
    priority: task.priority,
  };
}
