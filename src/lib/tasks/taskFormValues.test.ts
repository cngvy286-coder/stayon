import { describe, expect, it } from "vitest";

import type { Task } from "@/types/task";

import { taskToFormValues } from "./taskFormValues";

const VN = "Asia/Ho_Chi_Minh";

const task: Task = {
  id: "8b0f6d4e-3c2a-4f1b-9a7e-1d2c3b4a5f60",
  title: "Nộp báo cáo",
  note: "Gửi qua email",
  due_at: "2026-11-29T10:00:00.000Z", // 17:00 on the 29th in Vietnam
  status: "todo",
  priority: "high",
  completed_at: null,
  created_at: "2026-11-28T03:00:00.000Z",
  remind_before_minutes: null,
};

describe("taskToFormValues", () => {
  it("shows the deadline as a local date and time", () => {
    expect(taskToFormValues(task, VN)).toEqual({
      title: "Nộp báo cáo",
      note: "Gửi qua email",
      dueDate: "2026-11-29",
      dueTime: "17:00",
      priority: "high",
      remindBefore: "",
    });
  });

  it("fills the reminder", () => {
    expect(taskToFormValues({ ...task, remind_before_minutes: 60 }, VN).remindBefore).toBe("60");
  });

  it("uses the local date when it differs from the UTC date", () => {
    // 17:30 UTC on the 29th is 00:30 on the 30th in Vietnam.
    const late = { ...task, due_at: "2026-11-29T17:30:00.000Z" };
    expect(taskToFormValues(late, VN)).toMatchObject({ dueDate: "2026-11-30", dueTime: "00:30" });
  });

  it("leaves the deadline and note empty when there are none", () => {
    expect(taskToFormValues({ ...task, due_at: null, note: null }, VN)).toMatchObject({
      note: "",
      dueDate: "",
      dueTime: "",
    });
  });
});
