import { describe, expect, it } from "vitest";

import { firstFieldErrors } from "./auth";
import { eventFormSchema } from "./event";

const valid = {
  title: "  Toán cao cấp  ",
  date: "2026-11-28",
  startTime: "10:00",
  endTime: "11:30",
  color: "rose",
  note: "",
};

function errorsOf(input: Record<string, unknown>) {
  const result = eventFormSchema.safeParse(input);
  return result.success ? {} : firstFieldErrors(result.error);
}

describe("eventFormSchema", () => {
  it("accepts valid input, trims the title and turns an empty note into null", () => {
    expect(eventFormSchema.parse(valid)).toEqual({ ...valid, title: "Toán cao cấp", note: null });
  });

  it("keeps a non-empty note", () => {
    expect(eventFormSchema.parse({ ...valid, note: " Phòng A2 " }).note).toBe("Phòng A2");
  });

  it("requires a title", () => {
    expect(errorsOf({ ...valid, title: "   " })).toEqual({ title: "Vui lòng nhập tên lịch." });
  });

  it("rejects an invalid date", () => {
    expect(errorsOf({ ...valid, date: "2026-02-30" })).toEqual({ date: "Ngày không hợp lệ." });
  });

  it.each([
    ["11:00", "10:00"],
    ["10:00", "10:00"],
  ])("requires the end (%s → %s) to be after the start", (startTime, endTime) => {
    expect(errorsOf({ ...valid, startTime, endTime })).toEqual({
      endTime: "Giờ kết thúc phải sau giờ bắt đầu.",
    });
  });

  it("rejects a malformed time without a second, confusing error", () => {
    expect(errorsOf({ ...valid, startTime: "25:00" })).toEqual({ startTime: "Giờ không hợp lệ." });
  });

  it("only allows palette colours", () => {
    expect(errorsOf({ ...valid, color: "black" })).toEqual({ color: "Vui lòng chọn màu." });
  });
});
