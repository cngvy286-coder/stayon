import { describe, expect, it } from "vitest";

import {
  addDays,
  formatMinutes,
  formatWeekRange,
  isDateKey,
  isValidTimeZone,
  minutesOfDay,
  startOfDayInZone,
  startOfWeek,
  toDateKey,
  weekdayLabel,
} from "./date";

const VN = "Asia/Ho_Chi_Minh"; // UTC+7, no daylight saving
const NY = "America/New_York"; // has daylight saving

describe("calendar maths on date keys", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("finds the Monday of the week", () => {
    expect(startOfWeek("2026-11-28")).toBe("2026-11-23"); // Saturday
    expect(startOfWeek("2026-11-29")).toBe("2026-11-23"); // Sunday belongs to the same week
    expect(startOfWeek("2026-11-23")).toBe("2026-11-23"); // Monday
  });

  it("validates date keys", () => {
    expect(isDateKey("2026-11-28")).toBe(true);
    expect(isDateKey("2026-02-30")).toBe(false);
    expect(isDateKey("28/11/2026")).toBe(false);
  });

  it("labels weekdays in Vietnamese", () => {
    expect(weekdayLabel("2026-11-23")).toBe("T2");
    expect(weekdayLabel("2026-11-29")).toBe("CN");
  });
});

describe("timezone conversion", () => {
  it("reads the local date and time of an instant", () => {
    const instant = new Date("2026-11-27T18:30:00Z"); // 01:30 on the 28th in Vietnam
    expect(toDateKey(instant, VN)).toBe("2026-11-28");
    expect(minutesOfDay(instant, VN)).toBe(90);
    expect(toDateKey(instant, "UTC")).toBe("2026-11-27");
  });

  it("finds local midnight as a UTC instant", () => {
    expect(startOfDayInZone("2026-11-28", VN).toISOString()).toBe("2026-11-27T17:00:00.000Z");
  });

  it("handles daylight saving time", () => {
    expect(startOfDayInZone("2026-07-01", NY).toISOString()).toBe("2026-07-01T04:00:00.000Z");
    expect(startOfDayInZone("2026-12-01", NY).toISOString()).toBe("2026-12-01T05:00:00.000Z");
  });

  it("recognises valid IANA timezones", () => {
    expect(isValidTimeZone(VN)).toBe(true);
    expect(isValidTimeZone("Mars/Base")).toBe(false);
  });
});

describe("formatting", () => {
  it("formats a week range", () => {
    expect(formatWeekRange("2026-11-23")).toBe("23/11 – 29/11/2026");
    expect(formatWeekRange("2026-12-28")).toBe("28/12/2026 – 03/01/2027");
  });

  it("formats minutes as HH:mm", () => {
    expect(formatMinutes(450)).toBe("07:30");
    expect(formatMinutes(0)).toBe("00:00");
  });
});
