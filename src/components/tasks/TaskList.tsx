import { connection } from "next/server";

import { getUserTimezone } from "@/lib/data/events";
import { getTasks } from "@/lib/data/tasks";

import { TaskBoard } from "./TaskBoard";

/** Loads the user's tasks on the server and hands them to the interactive board. */
export async function TaskList() {
  // Everything below depends on the current time and the signed-in user (Supabase checks token
  // expiry with Date.now()), so never prerender it — not even during Partial Prefetching.
  await connection();
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

  return <TaskBoard tasks={tasks} nowIso={now.toISOString()} timeZone={timeZone} />;
}
