import { describe, expect, it } from "vitest";

import { firstFieldErrors } from "./auth";
import { eventFormSchema, eventIdSchema } from "./event";

describe("eventIdSchema", () => {
  it("accepts a UUID and rejects anything else", () => {
    expect(eventIdSchema.safeParse("8b0f6d4e-3c2a-4f1b-9a7e-1d2c3b4a5f60").success).toBe(true);
    expect(eventIdSchema.safeParse("1 or 1=1").success).toBe(false);
    expect(eventIdSchema.safeParse("").success).toBe(false);
  });
});

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
    expect(eventFormSchema.parse(valid)).toEqual({
      ...valid,
      title: "Toán cao cấp",
      note: null,
      repeatDays: null,
      repeatUntil: null,
    });
  });

  describe("weekly repeat", () => {
    const repeating = { ...valid, repeat: "on", repeatDays: "3,1,3", repeatUntil: "" };

    it("stores sorted, unique weekdays and no end date", () => {
      expect(eventFormSchema.parse(repeating)).toMatchObject({
        repeatDays: [1, 3],
        repeatUntil: null,
      });
    });

    it("keeps an end date on or after the start date", () => {
      expect(eventFormSchema.parse({ ...repeating, repeatUntil: "2026-12-31" }).repeatUntil).toBe(
        "2026-12-31",
      );
    });

    it("ignores repeat fields when repeat is off", () => {
      expect(
        eventFormSchema.parse({
          ...valid,
          repeat: "",
          repeatDays: "1,3",
          repeatUntil: "2026-12-31",
        }),
      ).toMatchObject({ repeatDays: null, repeatUntil: null });
    });

    it("requires at least one weekday", () => {
      expect(errorsOf({ ...repeating, repeatDays: "" })).toEqual({
        repeatDays: "Chọn ít nhất một thứ để lặp lại.",
      });
    });

    it("rejects an end date before the start date", () => {
      expect(errorsOf({ ...repeating, repeatUntil: "2026-11-27" })).toEqual({
        repeatUntil: "Ngày kết thúc lặp phải từ ngày bắt đầu trở đi.",
      });
    });

    it("rejects weekdays outside 1–7", () => {
      expect(errorsOf({ ...repeating, repeatDays: "0,8" })).toEqual({
        repeatDays: "Thứ không hợp lệ.",
      });
    });
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
