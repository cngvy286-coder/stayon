"use client";

import { useOptimistic, useState, useTransition } from "react";

import { setTaskStatus } from "@/app/(app)/tasks/actions";
import { Alert } from "@/components/ui/Alert";
import { groupTasks } from "@/lib/tasks/sortTasks";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/types/task";

import { TaskItem } from "./TaskItem";
import { STATUS_LABELS } from "./taskLabels";

const GROUP_HINTS: Record<TaskStatus, string> = {
  todo: "Chưa có việc cần làm.",
  doing: "Chưa có việc đang làm.",
  done: "Chưa có việc xong trong 7 ngày qua.",
};

type TaskBoardProps = {
  tasks: Task[];
  /** Server time (ISO) used for deadline labels, so server and client render the same text. */
  nowIso: string;
  timeZone: string;
};

/**
 * The three status columns. A status change moves the task immediately (optimistic update)
 * while the Server Action saves it; on failure the task goes back and an error is shown.
 */
export function TaskBoard({ tasks, nowIso, timeZone }: TaskBoardProps) {
  const now = new Date(nowIso);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [optimisticTasks, moveTask] = useOptimistic(
    tasks,
    (current, change: { id: string; status: TaskStatus }) =>
      current.map((task) =>
        task.id === change.id
          ? {
              ...task,
              status: change.status,
              // Only for ordering until the server answers; the database sets the real value.
              completed_at: change.status === "done" ? (task.completed_at ?? nowIso) : null,
            }
          : task,
      ),
  );

  const changeStatus = (id: string, status: TaskStatus) => {
    setError(null);
    startTransition(async () => {
      moveTask({ id, status });
      const result = await setTaskStatus(id, status);
      if (!result.ok) setError(result.message);
    });
  };

  const groups = groupTasks(optimisticTasks);

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert tone="error">{error}</Alert>}
      <div className="grid gap-6 lg:grid-cols-3">
        {TASK_STATUSES.map((status) => (
          <section key={status} aria-labelledby={`tasks-${status}`} className="flex flex-col gap-3">
            <h2 id={`tasks-${status}`} className="flex items-center gap-2 font-semibold">
              {STATUS_LABELS[status]}
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 tabular-nums">
                {groups[status].length}
              </span>
            </h2>
            {groups[status].length === 0 ? (
              <p className="text-sm text-ink-muted">{GROUP_HINTS[status]}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {groups[status].map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    now={now}
                    timeZone={timeZone}
                    onStatusChange={(next) => changeStatus(task.id, next)}
                  />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
