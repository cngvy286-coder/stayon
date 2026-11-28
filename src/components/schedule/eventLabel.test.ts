import { describe, expect, it } from "vitest";

import type { CalendarEvent } from "@/types/event";

import { withReminder } from "./eventLabel";

const event: CalendarEvent = {
  id: "e1",
  title: "Họp nhóm",
  note: null,
  start_at: "2026-11-28T07:00:00.000Z",
  end_at: "2026-11-28T08:00:00.000Z",
  color: "brand",
  repeat_days: null,
  repeat_until: null,
  remind_before_minutes: null,
};

describe("withReminder", () => {
  it("leaves the label alone without a reminder", () => {
    expect(withReminder("Sửa lịch: Họp nhóm, 14:00 – 15:00", event)).toBe(
      "Sửa lịch: Họp nhóm, 14:00 – 15:00",
    );
  });

  it("adds the reminder for screen readers", () => {
    expect(
      withReminder("Sửa lịch: Họp nhóm, 14:00 – 15:00", { ...event, remind_before_minutes: 15 }),
    ).toBe("Sửa lịch: Họp nhóm, 14:00 – 15:00, nhắc trước 15 phút");
  });
});
