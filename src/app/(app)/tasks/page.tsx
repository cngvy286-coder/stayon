import type { Metadata } from "next";
import { Suspense } from "react";

import { AddTaskButton } from "@/components/tasks/AddTaskButton";
import { TaskList } from "@/components/tasks/TaskList";

export const metadata: Metadata = { title: "Công việc" };

export default function TasksPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Công việc</h1>
          <p className="mt-1 text-ink-muted">Những việc cần làm, đang làm và vừa xong.</p>
        </div>
        <AddTaskButton />
      </div>

      {/* The list depends on the signed-in user, so it renders at request time. */}
      <Suspense fallback={<TaskListSkeleton />}>
        <TaskList />
      </Suspense>
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 lg:grid-cols-3" aria-label="Đang tải công việc">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="h-6 w-28 rounded-lg bg-brand-100/60" />
          <div className="h-16 rounded-xl bg-brand-50" />
          <div className="h-16 rounded-xl bg-brand-50" />
        </div>
      ))}
    </div>
  );
}
