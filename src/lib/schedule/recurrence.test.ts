import { describe, expect, it } from "vitest";

import type { CalendarEvent } from "@/types/event";

import { expandRecurringEvents } from "./recurrence";

const VN = "Asia/Ho_Chi_Minh";

/** "Toán cao cấp" first held on Monday 23/11/2026, 07:30–09:30 Vietnam time. */
const series: CalendarEvent = {
  id: "8b0f6d4e-3c2a-4f1b-9a7e-1d2c3b4a5f60",
  title: "Toán cao cấp",
  note: null,
  start_at: "2026-11-23T00:30:00.000Z",
  end_at: "2026-11-23T02:30:00.000Z",
  color: "teal",
  repeat_days: [1, 3], // T2, T4
  repeat_until: null,
};

const startsOf = (events: CalendarEvent[]) => events.map((event) => event.start_at);

describe("expandRecurringEvents", () => {
  it("creates an occurrence on each chosen weekday at the same local time", () => {
    const result = expandRecurringEvents([series], "2026-11-30", VN);
    expect(startsOf(result)).toEqual([
      "2026-11-30T00:30:00.000Z", // T2 07:30
      "2026-12-02T00:30:00.000Z", // T4 07:30
    ]);
    expect(result[0].end_at).toBe("2026-11-30T02:30:00.000Z");
    expect(result[0].series).toEqual({ start_at: series.start_at, end_at: series.end_at });
  });

  it("includes the first week from the start date", () => {
    expect(startsOf(expandRecurringEvents([series], "2026-11-23", VN))).toEqual([
      "2026-11-23T00:30:00.000Z",
      "2026-11-25T00:30:00.000Z",
    ]);
  });

  it("shows nothing before the series starts", () => {
    expect(expandRecurringEvents([series], "2026-11-16", VN)).toEqual([]);
  });

  it("skips weekdays earlier than the start date in the first week", () => {
    const fromWednesday = {
      ...series,
      start_at: "2026-11-25T00:30:00.000Z",
      end_at: "2026-11-25T02:30:00.000Z",
    };
    expect(startsOf(expandRecurringEvents([fromWednesday], "2026-11-23", VN))).toEqual([
      "2026-11-25T00:30:00.000Z",
    ]);
  });

  it("stops after repeat_until (inclusive)", () => {
    const untilMonday = { ...series, repeat_until: "2026-11-30" };
    expect(startsOf(expandRecurringEvents([untilMonday], "2026-11-30", VN))).toEqual([
      "2026-11-30T00:30:00.000Z",
    ]);
    expect(expandRecurringEvents([untilMonday], "2026-12-07", VN)).toEqual([]);
  });

  it("keeps the local time across a daylight-saving change", () => {
    const NY = "America/New_York";
    // Every Monday 09:00 New York time, starting in October (UTC-4).
    const weekly = {
      ...series,
      start_at: "2026-10-26T13:00:00.000Z",
      end_at: "2026-10-26T14:00:00.000Z",
      repeat_days: [1],
    };
    // After DST ends on 1/11/2026 New York is UTC-5, so 09:00 is 14:00 UTC.
    expect(startsOf(expandRecurringEvents([weekly], "2026-11-02", NY))).toEqual([
      "2026-11-02T14:00:00.000Z",
    ]);
  });

  it("passes one-off events through unchanged", () => {
    const oneOff = { ...series, repeat_days: null };
    expect(expandRecurringEvents([oneOff], "2026-11-23", VN)).toEqual([oneOff]);
  });
});
