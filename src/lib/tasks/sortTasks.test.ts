import { describe, expect, it } from "vitest";

import type { Task } from "@/types/task";

import { groupTasks } from "./sortTasks";

let nextId = 0;
function task(overrides: Partial<Task>): Task {
  nextId += 1;
  return {
    id: String(nextId),
    title: `Task ${nextId}`,
    note: null,
    due_at: null,
    status: "todo",
    priority: "medium",
    completed_at: null,
    // Each task is created one minute after the previous one.
    created_at: new Date(Date.UTC(2026, 10, 20, 0, nextId)).toISOString(),
    ...overrides,
  };
}

const titles = (tasks: Task[]) => tasks.map((t) => t.title);

describe("groupTasks", () => {
  it("splits tasks by status", () => {
    const groups = groupTasks([
      task({ title: "a", status: "todo" }),
      task({ title: "b", status: "doing" }),
      task({ title: "c", status: "done", completed_at: "2026-11-27T00:00:00Z" }),
    ]);
    expect(titles(groups.todo)).toEqual(["a"]);
    expect(titles(groups.doing)).toEqual(["b"]);
    expect(titles(groups.done)).toEqual(["c"]);
  });

  it("puts the soonest deadline first and tasks without a deadline last", () => {
    const { todo } = groupTasks([
      task({ title: "no deadline", priority: "high" }),
      task({ title: "next week", due_at: "2026-12-05T10:00:00Z" }),
      task({ title: "tomorrow", due_at: "2026-11-29T10:00:00Z" }),
    ]);
    expect(titles(todo)).toEqual(["tomorrow", "next week", "no deadline"]);
  });

  it("breaks ties by priority, then by creation time", () => {
    const due = "2026-11-29T10:00:00Z";
    const { todo } = groupTasks([
      task({ title: "low", due_at: due, priority: "low" }),
      task({ title: "high", due_at: due, priority: "high" }),
      task({ title: "medium first", due_at: due, priority: "medium" }),
      task({ title: "medium second", due_at: due, priority: "medium" }),
    ]);
    expect(titles(todo)).toEqual(["high", "medium first", "medium second", "low"]);
  });

  it("orders done tasks by most recently completed", () => {
    const { done } = groupTasks([
      task({ title: "older", status: "done", completed_at: "2026-11-25T00:00:00Z" }),
      task({ title: "newer", status: "done", completed_at: "2026-11-27T00:00:00Z" }),
    ]);
    expect(titles(done)).toEqual(["newer", "older"]);
  });
});
