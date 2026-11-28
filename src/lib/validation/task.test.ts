import { describe, expect, it } from "vitest";

import { firstFieldErrors } from "./auth";
import { taskFormSchema } from "./task";

const valid = {
  title: "  Nộp báo cáo  ",
  note: "",
  dueDate: "2026-11-29",
  dueTime: "17:00",
  priority: "high",
};

function errorsOf(input: Record<string, unknown>) {
  const result = taskFormSchema.safeParse(input);
  return result.success ? {} : firstFieldErrors(result.error);
}

describe("taskFormSchema", () => {
  it("accepts valid input, trims the title and empties the note to null", () => {
    expect(taskFormSchema.parse(valid)).toEqual({
      title: "Nộp báo cáo",
      note: null,
      priority: "high",
      due: { date: "2026-11-29", time: "17:00" },
    });
  });

  it("allows no deadline", () => {
    expect(taskFormSchema.parse({ ...valid, dueDate: "", dueTime: "" }).due).toBeNull();
  });

  it("uses 23:59 when a date is given without a time", () => {
    expect(taskFormSchema.parse({ ...valid, dueTime: "" }).due).toEqual({
      date: "2026-11-29",
      time: "23:59",
    });
  });

  it("requires a title", () => {
    expect(errorsOf({ ...valid, title: "  " })).toEqual({ title: "Vui lòng nhập tên việc." });
  });

  it("asks for a date when only a time is given", () => {
    expect(errorsOf({ ...valid, dueDate: "" })).toEqual({
      dueDate: "Chọn ngày cho hạn chót (hoặc xóa giờ).",
    });
  });

  it("rejects an invalid date or time", () => {
    expect(errorsOf({ ...valid, dueDate: "2026-02-30" })).toEqual({
      dueDate: "Ngày không hợp lệ.",
    });
    expect(errorsOf({ ...valid, dueTime: "24:00" })).toEqual({ dueTime: "Giờ không hợp lệ." });
  });

  it("only allows the three priorities", () => {
    expect(errorsOf({ ...valid, priority: "urgent" })).toEqual({
      priority: "Vui lòng chọn độ ưu tiên.",
    });
  });
});
