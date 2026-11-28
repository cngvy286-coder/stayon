import { describe, expect, it } from "vitest";

import {
  reminderLabel,
  reminderOptionLabel,
  reminderToFormValue,
  remindBeforeField,
} from "./index";

describe("reminder labels", () => {
  it("names each option", () => {
    expect(reminderOptionLabel(0)).toBe("Đúng giờ");
    expect(reminderOptionLabel(15)).toBe("15 phút");
    expect(reminderOptionLabel(60)).toBe("1 giờ");
    expect(reminderOptionLabel(1440)).toBe("1 ngày");
  });

  it("describes a stored reminder", () => {
    expect(reminderLabel(null)).toBeNull();
    expect(reminderLabel(0)).toBe("Nhắc đúng giờ");
    expect(reminderLabel(30)).toBe("Nhắc trước 30 phút");
    expect(reminderLabel(1440)).toBe("Nhắc trước 1 ngày");
    expect(reminderLabel(7)).toBeNull();
  });

  it("turns a stored reminder into a form value", () => {
    expect(reminderToFormValue(null)).toBe("");
    expect(reminderToFormValue(15)).toBe("15");
  });
});

describe("remindBeforeField", () => {
  it("parses empty as no reminder and numbers as minutes", () => {
    expect(remindBeforeField.parse("")).toBeNull();
    expect(remindBeforeField.parse(undefined)).toBeNull();
    expect(remindBeforeField.parse("0")).toBe(0);
    expect(remindBeforeField.parse("1440")).toBe(1440);
  });

  it("rejects values that are not offered", () => {
    expect(remindBeforeField.safeParse("7").success).toBe(false);
    expect(remindBeforeField.safeParse("abc").success).toBe(false);
  });
});
