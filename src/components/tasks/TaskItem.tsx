"use client";

import { useCallback, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { reminderLabel } from "@/lib/reminders";
import { dueLabel } from "@/lib/tasks/dueLabel";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/types/task";

import { EditTaskModal } from "./EditTaskModal";
import { PRIORITY_STYLES, STATUS_LABELS } from "./taskLabels";

type TaskItemProps = {
  task: Task;
  now: Date;
  timeZone: string;
  onStatusChange: (status: TaskStatus) => void;
};

/**
 * One task row:
 * - round checkbox to mark done / not done
 * - title (opens the edit modal), priority badge, deadline (red when overdue), note
 * - status select to move it to any group
 */
export function TaskItem({ task, now, timeZone, onStatusChange }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const closeEditor = useCallback(() => setEditing(false), []);
  const priority = PRIORITY_STYLES[task.priority];
  const due = task.due_at ? dueLabel(task.due_at, task.status, now, timeZone) : null;
  const done = task.status === "done";
  const reminder = reminderLabel(task.remind_before_minutes);

  return (
    <li className="flex gap-3 rounded-xl border border-line bg-surface px-3 py-3 sm:px-4">
      <label className="relative mt-0.5 grid size-5 shrink-0 cursor-pointer place-items-center">
        <input
          type="checkbox"
          checked={done}
          onChange={() => onStatusChange(done ? "todo" : "done")}
          aria-label={`Hoàn thành: ${task.title}`}
          className="peer size-5 cursor-pointer appearance-none rounded-full border-2 border-ink-muted/40 transition-colors checked:border-teal-600 checked:bg-teal-600 hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        />
        <Icon
          name="tick"
          className="pointer-events-none absolute size-3.5 text-white opacity-0 peer-checked:opacity-100"
        />
      </label>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Sửa việc: ${task.title}`}
            className={`min-w-0 cursor-pointer text-left font-medium break-words hover:text-brand-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${done ? "text-ink-muted line-through" : ""}`}
          >
            {task.title}
          </button>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${priority.badge}`}
          >
            {priority.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
          <select
            value={task.status}
            onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
            aria-label={`Trạng thái: ${task.title}`}
            className="h-7 cursor-pointer rounded-md border border-line bg-surface px-1.5 text-xs font-medium text-ink-muted focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          {due && (
            <span
              className={`tabular-nums ${due.overdue ? "font-semibold text-rose-700" : "text-ink-muted"}`}
            >
              {due.overdue && "Quá hạn · "}
              {due.text}
            </span>
          )}
          {reminder && (
            <span className="inline-flex items-center gap-1 text-ink-muted" title={reminder}>
              <Icon name="bell" className="size-3.5" />
              <span className="sr-only">{reminder}</span>
            </span>
          )}
          {task.note && <span className="min-w-0 truncate text-ink-muted">{task.note}</span>}
        </div>
      </div>

      <EditTaskModal task={task} timeZone={timeZone} open={editing} onClose={closeEditor} />
    </li>
  );
}
