import { describe, expect, it } from "vitest";

import { dueLabel } from "./dueLabel";

const VN = "Asia/Ho_Chi_Minh";
// Now: Saturday 28/11/2026, 10:00 in Vietnam.
const now = new Date("2026-11-28T03:00:00Z");

/** A Vietnam local time as a UTC ISO string. */
const vn = (local: string) => new Date(`${local}:00+07:00`).toISOString();

describe("dueLabel", () => {
  it("says today, tomorrow and yesterday", () => {
    expect(dueLabel(vn("2026-11-28T17:00"), "todo", now, VN).text).toBe("Hôm nay 17:00");
    expect(dueLabel(vn("2026-11-29T09:00"), "todo", now, VN).text).toBe("Ngày mai 09:00");
    expect(dueLabel(vn("2026-11-27T08:00"), "todo", now, VN).text).toBe("Hôm qua 08:00");
  });

  it("shows day/month for other dates this year and adds the year otherwise", () => {
    expect(dueLabel(vn("2026-12-05T14:00"), "todo", now, VN).text).toBe("05/12 14:00");
    expect(dueLabel(vn("2027-01-05T14:00"), "todo", now, VN).text).toBe("05/01/2027 14:00");
  });

  it("uses the local date near midnight", () => {
    // 23:30 Vietnam on the 28th is still 16:30 UTC on the 28th; 00:30 Vietnam is the 29th.
    expect(dueLabel(vn("2026-11-29T00:30"), "todo", now, VN).text).toBe("Ngày mai 00:30");
  });

  it("flags passed deadlines as overdue unless the task is done", () => {
    expect(dueLabel(vn("2026-11-28T09:59"), "todo", now, VN).overdue).toBe(true);
    expect(dueLabel(vn("2026-11-28T09:59"), "doing", now, VN).overdue).toBe(true);
    expect(dueLabel(vn("2026-11-28T09:59"), "done", now, VN).overdue).toBe(false);
    expect(dueLabel(vn("2026-11-28T10:01"), "todo", now, VN).overdue).toBe(false);
  });
});
