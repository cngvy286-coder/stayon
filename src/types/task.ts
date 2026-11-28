/** Values allowed by the tasks.status check constraint. */
export const TASK_STATUSES = ["todo", "doing", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Values allowed by the tasks.priority check constraint, highest first. */
export const TASK_PRIORITIES = ["high", "medium", "low"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/** A row of public.tasks as the app reads it. Times are ISO strings in UTC. */
export type Task = {
  id: string;
  title: string;
  note: string | null;
  due_at: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  completed_at: string | null;
  created_at: string;
};
