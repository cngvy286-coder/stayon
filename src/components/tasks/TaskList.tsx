import { getUserTimezone } from "@/lib/data/events";
import { getTasks } from "@/lib/data/tasks";
import { groupTasks } from "@/lib/tasks/sortTasks";
import { TASK_STATUSES } from "@/types/task";

import { TaskItem } from "./TaskItem";
import { STATUS_LABELS } from "./taskLabels";

const GROUP_HINTS = {
  todo: "Chưa có việc cần làm.",
  doing: "Chưa có việc đang làm.",
  done: "Chưa có việc xong trong 7 ngày qua.",
} as const;

/** Loads the user's tasks and shows them in three status groups. */
export async function TaskList() {
  // Read the session (request data) before the current time, as Cache Components requires.
  const timeZone = await getUserTimezone();
  const now = new Date();
  const tasks = await getTasks(now);

  if (tasks.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 px-5 py-8 text-center text-brand-700">
        Chưa có việc nào. Bấm <span className="font-semibold">Thêm việc</span> để bắt đầu.
      </p>
    );
  }

  const groups = groupTasks(tasks);

  return (
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
                <TaskItem key={task.id} task={task} now={now} timeZone={timeZone} />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
