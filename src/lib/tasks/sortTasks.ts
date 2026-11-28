import type { Task, TaskPriority, TaskStatus } from "@/types/task";

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

/**
 * Open tasks: soonest deadline first, tasks without a deadline last;
 * same deadline -> higher priority first; then oldest first.
 */
function compareOpen(a: Task, b: Task): number {
  if (a.due_at !== b.due_at) {
    if (a.due_at === null) return 1;
    if (b.due_at === null) return -1;
    const byDue = new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    if (byDue !== 0) return byDue;
  }
  return (
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

/** Done tasks: most recently completed first. */
function compareDone(a: Task, b: Task): number {
  return new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime();
}

/** Split tasks into the three status groups shown on /tasks, each in display order. */
export function groupTasks(tasks: Task[]): Record<TaskStatus, Task[]> {
  return {
    todo: tasks.filter((task) => task.status === "todo").sort(compareOpen),
    doing: tasks.filter((task) => task.status === "doing").sort(compareOpen),
    done: tasks.filter((task) => task.status === "done").sort(compareDone),
  };
}
