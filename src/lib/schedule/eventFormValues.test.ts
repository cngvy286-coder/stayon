import { describe, expect, it } from "vitest";

import type { CalendarEvent } from "@/types/event";

import { eventToFormValues } from "./eventFormValues";

const VN = "Asia/Ho_Chi_Minh";

const event: CalendarEvent = {
  id: "8b0f6d4e-3c2a-4f1b-9a7e-1d2c3b4a5f60",
  title: "Thử lưu lịch",
  note: null,
  start_at: "2026-11-28T03:00:00.000Z", // 10:00 in Vietnam
  end_at: "2026-11-28T04:30:00.000Z", // 11:30 in Vietnam
  color: "rose",
};

describe("eventToFormValues", () => {
  it("shows the stored UTC times in the user's timezone", () => {
    expect(eventToFormValues(event, VN)).toEqual({
      title: "Thử lưu lịch",
      date: "2026-11-28",
      startTime: "10:00",
      endTime: "11:30",
      color: "rose",
      note: "",
      spansDays: false,
    });
  });

  it("uses the local date, which can differ from the UTC date", () => {
    // 23:30 UTC on the 27th is 06:30 on the 28th in Vietnam.
    const early = { ...event, start_at: "2026-11-27T23:30:00Z", end_at: "2026-11-28T00:30:00Z" };
    expect(eventToFormValues(early, VN)).toMatchObject({
      date: "2026-11-28",
      startTime: "06:30",
      endTime: "07:30",
    });
  });

  it("keeps the note", () => {
    expect(eventToFormValues({ ...event, note: "Phòng A2" }, VN).note).toBe("Phòng A2");
  });

  it("flags events that end on a later day", () => {
    const overnight = {
      ...event,
      start_at: "2026-11-28T15:00:00Z",
      end_at: "2026-11-28T18:00:00Z",
    };
    expect(eventToFormValues(overnight, VN)).toMatchObject({
      date: "2026-11-28",
      startTime: "22:00",
      endTime: "01:00",
      spansDays: true,
    });
  });
});
