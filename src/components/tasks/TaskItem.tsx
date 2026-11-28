import { dueLabel } from "@/lib/tasks/dueLabel";
import type { Task } from "@/types/task";

import { PRIORITY_STYLES } from "./taskLabels";

type TaskItemProps = { task: Task; now: Date; timeZone: string };

/** One task row: title, priority badge, deadline (red when overdue) and note. */
export function TaskItem({ task, now, timeZone }: TaskItemProps) {
  const priority = PRIORITY_STYLES[task.priority];
  const due = task.due_at ? dueLabel(task.due_at, task.status, now, timeZone) : null;
  const done = task.status === "done";

  return (
    <li className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <p
          className={`min-w-0 font-medium break-words ${done ? "text-ink-muted line-through" : ""}`}
        >
          {task.title}
        </p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${priority.badge}`}
        >
          {priority.label}
        </span>
      </div>

      {(due || task.note) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {due && (
            <span
              className={`tabular-nums ${due.overdue ? "font-semibold text-rose-700" : "text-ink-muted"}`}
            >
              {due.overdue && "Quá hạn · "}
              {due.text}
            </span>
          )}
          {task.note && <span className="min-w-0 truncate text-ink-muted">{task.note}</span>}
        </div>
      )}
    </li>
  );
}
