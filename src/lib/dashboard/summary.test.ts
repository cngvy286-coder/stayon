import { describe, expect, it } from "vitest";

import type { CalendarEvent } from "@/types/event";
import type { Task } from "@/types/task";

import { buildDashboardSummary, TODAY_TASKS_LIMIT } from "./summary";

const VN = "Asia/Ho_Chi_Minh";
/** Saturday 28/11/2026, 10:00 in Vietnam. The week runs Mon 23/11 – Sun 29/11. */
const NOW = new Date("2026-11-28T10:00:00+07:00");

/** A Vietnam local time ("2026-11-28T17:00") as a UTC ISO string. */
const vn = (local: string) => new Date(`${local}:00+07:00`).toISOString();

let nextId = 0;
function task(overrides: Partial<Task>): Task {
  nextId += 1;
  return {
    id: `task-${nextId}`,
    title: `Task ${nextId}`,
    note: null,
    due_at: null,
    status: "todo",
    priority: "medium",
    completed_at: null,
    created_at: vn("2026-11-20T08:00"),
    ...overrides,
  };
}

function event(title: string, from: string, to: string): CalendarEvent {
  nextId += 1;
  return {
    id: `event-${nextId}`,
    title,
    note: null,
    start_at: vn(from),
    end_at: vn(to),
    color: "teal",
    repeat_days: null,
    repeat_until: null,
  };
}

const summarize = (tasks: Task[], events: CalendarEvent[] = []) =>
  buildDashboardSummary(tasks, events, NOW, VN);

describe("weekly progress", () => {
  it("counts tasks due this week or completed this week", () => {
    const summary = summarize([
      task({
        due_at: vn("2026-11-24T09:00"),
        status: "done",
        completed_at: vn("2026-11-24T08:00"),
      }),
      task({ due_at: vn("2026-11-29T17:00") }), // due Sunday, open
      task({ due_at: vn("2026-11-27T17:00"), status: "doing" }), // overdue, open
      task({ due_at: null, status: "done", completed_at: vn("2026-11-28T09:00") }), // no deadline
    ]);
    expect(summary.week).toEqual({ done: 2, total: 4, percent: 50 });
  });

  it("ignores tasks from other weeks and open tasks without a deadline", () => {
    const summary = summarize([
      task({ due_at: vn("2026-11-30T09:00") }), // next Monday
      task({ due_at: vn("2026-11-22T23:00") }), // last Sunday
      task({ due_at: null }),
      task({ due_at: vn("2026-11-25T09:00") }),
    ]);
    expect(summary.week).toEqual({ done: 0, total: 1, percent: 0 });
  });

  it("counts a task done this week even if its deadline was last week", () => {
    const summary = summarize([
      task({
        due_at: vn("2026-11-20T09:00"),
        status: "done",
        completed_at: vn("2026-11-23T08:00"),
      }),
    ]);
    expect(summary.week).toEqual({ done: 1, total: 1, percent: 100 });
  });

  it("has no percentage when the week has no tasks", () => {
    expect(summarize([]).week).toEqual({ done: 0, total: 0, percent: null });
  });

  it("rounds the percentage", () => {
    const summary = summarize([
      task({
        due_at: vn("2026-11-26T09:00"),
        status: "done",
        completed_at: vn("2026-11-26T08:00"),
      }),
      task({ due_at: vn("2026-11-29T09:00") }),
      task({ due_at: vn("2026-11-29T10:00") }),
    ]);
    expect(summary.week.percent).toBe(33);
  });
});

describe("today's tasks", () => {
  it("lists overdue and due-today open tasks, soonest first", () => {
    const summary = summarize([
      task({ title: "today 17:00", due_at: vn("2026-11-28T17:00") }),
      task({ title: "overdue", due_at: vn("2026-11-26T09:00") }),
      task({ title: "today 08:00", due_at: vn("2026-11-28T08:00") }),
      task({ title: "tomorrow", due_at: vn("2026-11-29T09:00") }),
      task({
        title: "done today",
        due_at: vn("2026-11-28T09:00"),
        status: "done",
        completed_at: vn("2026-11-28T09:00"),
      }),
      task({ title: "no deadline" }),
    ]);
    expect(summary.todayTasks.map((t) => t.title)).toEqual([
      "overdue",
      "today 08:00",
      "today 17:00",
    ]);
    expect(summary.todayTasksTotal).toBe(3);
    expect(summary.dueTodayCount).toBe(2);
    // "overdue" and "today 08:00" have both passed (it is 10:00).
    expect(summary.overdueCount).toBe(2);
  });

  it("uses the Vietnam date at midnight boundaries", () => {
    // 23:30 on the 28th in Vietnam is still "today"; 00:30 on the 29th is tomorrow.
    const summary = summarize([
      task({ title: "late tonight", due_at: vn("2026-11-28T23:30") }),
      task({ title: "just after midnight", due_at: vn("2026-11-29T00:30") }),
    ]);
    expect(summary.todayTasks.map((t) => t.title)).toEqual(["late tonight"]);
  });

  it(`shows at most ${TODAY_TASKS_LIMIT} but keeps the full count`, () => {
    const many = Array.from({ length: 7 }, (_, i) => task({ due_at: vn(`2026-11-28T1${i}:00`) }));
    const summary = summarize(many);
    expect(summary.todayTasks).toHaveLength(TODAY_TASKS_LIMIT);
    expect(summary.todayTasksTotal).toBe(7);
  });
});

describe("today's events", () => {
  it("orders today's events and marks past, current and upcoming", () => {
    const summary = summarize(
      [],
      [
        event("Lập trình Web", "2026-11-28T13:00", "2026-11-28T16:00"),
        event("Toán", "2026-11-28T07:30", "2026-11-28T09:30"),
        event("Tiếng Anh", "2026-11-28T09:30", "2026-11-28T11:00"),
        event("Ngày mai", "2026-11-29T08:00", "2026-11-29T09:00"),
      ],
    );
    expect(summary.todayEvents.map((e) => [e.event.title, e.state])).toEqual([
      ["Toán", "past"],
      ["Tiếng Anh", "now"],
      ["Lập trình Web", "upcoming"],
    ]);
    expect(summary.nextEvent?.event.title).toBe("Lập trình Web");
    expect(summary.todayEvents[0]).toMatchObject({ startMin: 450, endMin: 570 });
  });

  it("clips an event that started yesterday to today", () => {
    const summary = summarize([], [event("Ôn thi", "2026-11-27T22:00", "2026-11-28T01:00")]);
    expect(summary.todayEvents[0]).toMatchObject({ startMin: 0, endMin: 60, state: "past" });
    expect(summary.nextEvent).toBeNull();
  });
});
