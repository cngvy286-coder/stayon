import { describe, expect, it } from "vitest";

import type { CalendarEvent } from "@/types/event";

import { buildWeekLayout } from "./weekLayout";

const VN = "Asia/Ho_Chi_Minh";
const WEEK = "2026-11-23"; // Monday

let nextId = 0;
/** Build an event from Vietnam local times, e.g. at("2026-11-23", "07:30", "09:00"). */
function at(day: string, from: string, to: string, toDay = day): CalendarEvent {
  return {
    id: String(++nextId),
    title: `Event ${nextId}`,
    note: null,
    start_at: new Date(`${day}T${from}:00+07:00`).toISOString(),
    end_at: new Date(`${toDay}T${to}:00+07:00`).toISOString(),
    color: "brand",
  };
}

describe("buildWeekLayout", () => {
  it("creates 7 days starting on Monday", () => {
    const layout = buildWeekLayout([], WEEK, VN);
    expect(layout.days.map((day) => day.key)).toEqual([
      "2026-11-23",
      "2026-11-24",
      "2026-11-25",
      "2026-11-26",
      "2026-11-27",
      "2026-11-28",
      "2026-11-29",
    ]);
    expect(layout.startHour).toBe(7);
    expect(layout.endHour).toBe(22);
  });

  it("places an event on the right day and time in the user's timezone", () => {
    const layout = buildWeekLayout([at("2026-11-25", "07:30", "09:00")], WEEK, VN);
    const [segment] = layout.days[2].segments;
    expect(segment.startMin).toBe(450);
    expect(segment.endMin).toBe(540);
    expect(layout.days[1].segments).toHaveLength(0);
  });

  it("splits an event that runs past midnight", () => {
    const layout = buildWeekLayout([at("2026-11-23", "22:00", "01:00", "2026-11-24")], WEEK, VN);
    const [monday] = layout.days[0].segments;
    const [tuesday] = layout.days[1].segments;
    expect([monday.startMin, monday.endMin, monday.continuesAfter]).toEqual([1320, 1440, true]);
    expect([tuesday.startMin, tuesday.endMin, tuesday.continuesBefore]).toEqual([0, 60, true]);
    expect(layout.startHour).toBe(0);
    expect(layout.endHour).toBe(24);
  });

  it("ignores events outside the week", () => {
    const layout = buildWeekLayout([at("2026-11-30", "08:00", "09:00")], WEEK, VN);
    expect(layout.days.every((day) => day.segments.length === 0)).toBe(true);
  });

  it("puts overlapping events side by side and frees lanes afterwards", () => {
    const layout = buildWeekLayout(
      [
        at("2026-11-23", "08:00", "10:00"),
        at("2026-11-23", "09:00", "11:00"),
        at("2026-11-23", "09:30", "10:30"),
        at("2026-11-23", "13:00", "14:00"),
      ],
      WEEK,
      VN,
    );
    const lanes = layout.days[0].segments.map((s) => [s.startMin, s.lane, s.lanes]);
    expect(lanes).toEqual([
      [480, 0, 3],
      [540, 1, 3],
      [570, 2, 3],
      [780, 0, 1],
    ]);
  });

  it("reuses a lane once the earlier event has ended", () => {
    const layout = buildWeekLayout(
      [
        at("2026-11-23", "08:00", "12:00"),
        at("2026-11-23", "08:00", "09:00"),
        at("2026-11-23", "09:00", "10:00"),
      ],
      WEEK,
      VN,
    );
    const lanes = layout.days[0].segments.map((s) => [s.startMin, s.endMin, s.lane, s.lanes]);
    expect(lanes).toEqual([
      [480, 720, 0, 2],
      [480, 540, 1, 2],
      [540, 600, 1, 2],
    ]);
  });
});
