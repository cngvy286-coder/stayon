import Link from "next/link";

import { PRIORITY_STYLES } from "@/components/tasks/taskLabels";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { dueLabel } from "@/lib/tasks/dueLabel";
import type { Task } from "@/types/task";

type TodayTasksProps = {
  tasks: Task[];
  total: number;
  now: Date;
  timeZone: string;
};

/** "Việc cần làm hôm nay": overdue + due-today open tasks, linking to /tasks. */
export function TodayTasks({ tasks, total, now, timeZone }: TodayTasksProps) {
  return (
    <section aria-labelledby="today-tasks" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="today-tasks" className="font-semibold">
          Việc cần làm hôm nay
        </h2>
        <Link href="/tasks" className="text-sm font-medium text-brand-700 hover:underline">
          Xem tất cả
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line bg-surface p-5">
          <p className="text-sm text-ink-muted">Không có việc nào đến hạn hôm nay.</p>
          <ButtonLink href="/tasks" variant="secondary">
            Thêm việc
          </ButtonLink>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => {
            const due = dueLabel(task.due_at!, task.status, now, timeZone);
            const priority = PRIORITY_STYLES[task.priority];
            return (
              <li key={task.id}>
                <Link
                  href="/tasks"
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-brand-300"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{task.title}</span>
                    <span
                      className={`text-sm tabular-nums ${due.overdue ? "font-semibold text-rose-700" : "text-ink-muted"}`}
                    >
                      {due.overdue && "Quá hạn · "}
                      {due.text}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${priority.badge}`}
                  >
                    {priority.label}
                  </span>
                </Link>
              </li>
            );
          })}
          {total > tasks.length && (
            <li className="text-sm text-ink-muted">
              … và {total - tasks.length} việc khác.{" "}
              <Link href="/tasks" className="font-medium text-brand-700 hover:underline">
                Xem tất cả
              </Link>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
