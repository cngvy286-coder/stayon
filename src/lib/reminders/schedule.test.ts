import { describe, expect, it } from "vitest";

import { expandRecurringEvents } from "@/lib/schedule/recurrence";
import type { CalendarEvent } from "@/types/event";
import type { Task } from "@/types/task";

import { buildReminders } from "./schedule";

const VN = "Asia/Ho_Chi_Minh";
/** Saturday 28/11/2026, 10:00 in Vietnam. */
const NOW = new Date("2026-11-28T10:00:00+07:00");
const vn = (local: string) => new Date(`${local}:00+07:00`).toISOString();

const event = (overrides: Partial<CalendarEvent>): CalendarEvent => ({
  id: "e1",
  title: "Toán cao cấp",
  note: null,
  start_at: vn("2026-11-28T13:00"),
  end_at: vn("2026-11-28T15:00"),
  color: "teal",
  repeat_days: null,
  repeat_until: null,
  remind_before_minutes: 15,
  ...overrides,
});

const task = (overrides: Partial<Task>): Task => ({
  id: "t1",
  title: "Nộp báo cáo",
  note: null,
  due_at: vn("2026-11-28T17:00"),
  status: "todo",
  priority: "high",
  completed_at: null,
  created_at: vn("2026-11-27T08:00"),
  remind_before_minutes: 60,
  ...overrides,
});

describe("buildReminders", () => {
  it("reminds before an event with its time range", () => {
    expect(buildReminders([event({})], [], NOW, VN)).toEqual([
      {
        id: `event:e1:${vn("2026-11-28T12:45")}`,
        fireAt: vn("2026-11-28T12:45"),
        title: "Sắp đến: Toán cao cấp",
        body: "13:00 – 15:00 · bắt đầu sau 15 phút",
        href: "/schedule?week=2026-11-28",
      },
    ]);
  });

  it("reminds before a task deadline", () => {
    expect(buildReminders([], [task({})], NOW, VN)).toEqual([
      {
        id: `task:t1:${vn("2026-11-28T16:00")}`,
        fireAt: vn("2026-11-28T16:00"),
        title: "Sắp đến hạn: Nộp báo cáo",
        body: "Hạn 17:00 · còn 1 giờ",
        href: "/tasks",
      },
    ]);
  });

  it("words on-time reminders and other days", () => {
    const [eventReminder] = buildReminders(
      [
        event({
          start_at: vn("2026-11-29T08:00"),
          end_at: vn("2026-11-29T09:00"),
          remind_before_minutes: 0,
        }),
      ],
      [],
      NOW,
      VN,
    );
    expect(eventReminder.body).toBe("08:00 29/11 – 09:00 · bắt đầu ngay bây giờ");

    const [taskReminder] = buildReminders(
      [],
      [task({ due_at: vn("2026-11-29T11:00"), remind_before_minutes: 1440 })],
      NOW,
      VN,
    );
    expect(taskReminder.body).toBe("Hạn 11:00 29/11 · còn 1 ngày");
  });

  it("skips items without a reminder, done tasks and tasks without a deadline", () => {
    expect(
      buildReminders(
        [event({ remind_before_minutes: null })],
        [
          task({ id: "done", status: "done", completed_at: vn("2026-11-28T09:00") }),
          task({ id: "none", due_at: null }),
          task({ id: "off", remind_before_minutes: null }),
        ],
        NOW,
        VN,
      ),
    ).toEqual([]);
  });

  it("keeps reminders missed by up to 10 minutes and drops older ones", () => {
    const missed5 = event({
      id: "late",
      start_at: vn("2026-11-28T10:10"),
      end_at: vn("2026-11-28T11:00"),
    }); // fired 09:55
    const missed20 = event({
      id: "old",
      start_at: vn("2026-11-28T09:55"),
      end_at: vn("2026-11-28T11:00"),
    }); // fired 09:40
    expect(buildReminders([missed5, missed20], [], NOW, VN).map((r) => r.id)).toEqual([
      `event:late:${vn("2026-11-28T09:55")}`,
    ]);
  });

  it("only looks 24 hours ahead", () => {
    const tomorrow = event({
      id: "soon",
      start_at: vn("2026-11-29T10:10"),
      end_at: vn("2026-11-29T11:00"),
    });
    const later = event({
      id: "later",
      start_at: vn("2026-11-29T11:00"),
      end_at: vn("2026-11-29T12:00"),
    });
    expect(buildReminders([tomorrow, later], [], NOW, VN).map((r) => r.id)).toEqual([
      `event:soon:${vn("2026-11-29T09:55")}`,
    ]);
  });

  it("reminds every occurrence of a repeating event", () => {
    // Every day of the week at 07:30, reminder 15 min before; expanded for this week.
    const series = event({
      start_at: vn("2026-11-23T07:30"),
      end_at: vn("2026-11-23T09:30"),
      repeat_days: [1, 2, 3, 4, 5, 6, 7],
    });
    const occurrences = expandRecurringEvents([series], "2026-11-23", VN);
    // Saturday 07:15 has passed (more than 10 minutes ago); Sunday 07:15 is within 24 hours.
    expect(buildReminders(occurrences, [], NOW, VN).map((r) => r.fireAt)).toEqual([
      vn("2026-11-29T07:15"),
    ]);
  });

  it("sorts reminders by time", () => {
    const reminders = buildReminders(
      [event({ start_at: vn("2026-11-28T18:00"), end_at: vn("2026-11-28T19:00") })],
      [task({ due_at: vn("2026-11-28T12:00"), remind_before_minutes: 30 })],
      NOW,
      VN,
    );
    expect(reminders.map((r) => r.fireAt)).toEqual([
      vn("2026-11-28T11:30"),
      vn("2026-11-28T17:45"),
    ]);
  });
});
