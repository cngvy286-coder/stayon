import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TodayEvent } from "@/lib/dashboard/summary";
import type { CalendarEvent } from "@/types/event";
import type { Task } from "@/types/task";

import { ProgressBar } from "./ProgressBar";
import { TodayEvents } from "./TodayEvents";
import { TodayTasks } from "./TodayTasks";

const VN = "Asia/Ho_Chi_Minh";
const NOW = new Date("2026-11-28T10:00:00+07:00");

const overdue: Task = {
  id: "t1",
  title: "Nộp báo cáo",
  note: null,
  due_at: "2026-11-27T10:00:00.000Z", // yesterday 17:00 in Vietnam
  status: "todo",
  priority: "high",
  completed_at: null,
  created_at: "2026-11-20T00:00:00.000Z",
};

const baseEvent: CalendarEvent = {
  id: "e1",
  title: "Tiếng Anh",
  note: null,
  start_at: "2026-11-28T02:30:00.000Z",
  end_at: "2026-11-28T04:00:00.000Z",
  color: "teal",
  repeat_days: [6],
  repeat_until: null,
};

describe("TodayTasks", () => {
  it("shows the deadline with an overdue label and links to /tasks", () => {
    render(<TodayTasks tasks={[overdue]} total={1} now={NOW} timeZone={VN} />);

    expect(screen.getByText("Quá hạn · Hôm qua 17:00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nộp báo cáo/ })).toHaveAttribute("href", "/tasks");
  });

  it("says how many more tasks are hidden", () => {
    render(<TodayTasks tasks={[overdue]} total={4} now={NOW} timeZone={VN} />);

    expect(screen.getByText(/và 3 việc khác/)).toBeInTheDocument();
  });

  it("offers to add a task when there is nothing due", () => {
    render(<TodayTasks tasks={[]} total={0} now={NOW} timeZone={VN} />);

    expect(screen.getByText("Không có việc nào đến hạn hôm nay.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Thêm việc" })).toHaveAttribute("href", "/tasks");
  });
});

describe("TodayEvents", () => {
  it("lists events with their times and marks the current one", () => {
    const events: TodayEvent[] = [
      {
        event: { ...baseEvent, id: "a", title: "Toán" },
        startMin: 450,
        endMin: 570,
        state: "past",
      },
      { event: baseEvent, startMin: 570, endMin: 660, state: "now" },
    ];
    render(<TodayEvents events={events} />);

    expect(screen.getByText("07:30 – 09:30")).toBeInTheDocument();
    expect(screen.getByText("Đang diễn ra")).toBeInTheDocument();
    expect(screen.getByText("(đã qua)")).toBeInTheDocument();
  });

  it("offers to add an event when the day is empty", () => {
    render(<TodayEvents events={[]} />);

    expect(screen.getByRole("link", { name: "Thêm lịch" })).toHaveAttribute("href", "/schedule");
  });
});

describe("ProgressBar", () => {
  it("exposes the value to assistive technology", () => {
    render(<ProgressBar percent={33} label="Tiến độ công việc tuần này" />);

    expect(screen.getByRole("progressbar", { name: "Tiến độ công việc tuần này" })).toHaveAttribute(
      "aria-valuenow",
      "33",
    );
  });
});
