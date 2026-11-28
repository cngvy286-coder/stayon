import { z } from "zod";

import { isDateKey, parseTimeToMinutes } from "@/lib/utils/date";
import { EVENT_COLORS } from "@/types/event";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ không hợp lệ.");

/**
 * Fields of the "Thêm lịch" / "Sửa lịch" form. Dates and times are in the user's own timezone.
 * Repeat fields come in as form strings:
 * - repeat: "on" when "Lặp lại hàng tuần" is ticked, otherwise ""
 * - repeatDays: ISO weekdays joined by commas, e.g. "1,3" (T2, T4)
 * - repeatUntil: "YYYY-MM-DD" or ""
 */
export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên lịch.")
      .max(100, "Tên lịch tối đa 100 ký tự."),
    date: z.string().refine(isDateKey, "Ngày không hợp lệ."),
    startTime: time,
    endTime: time,
    color: z.enum(EVENT_COLORS, "Vui lòng chọn màu."),
    note: z
      .string()
      .trim()
      .max(1000, "Ghi chú tối đa 1000 ký tự.")
      .transform((value) => (value === "" ? null : value)),
    repeat: z
      .string()
      .optional()
      .transform((value) => value === "on"),
    repeatDays: z
      .string()
      .optional()
      .transform((value) =>
        [...new Set((value ?? "").split(",").filter(Boolean).map(Number))].sort((a, b) => a - b),
      )
      .refine((days) => days.every((day) => Number.isInteger(day) && day >= 1 && day <= 7), {
        message: "Thứ không hợp lệ.",
      }),
    repeatUntil: z
      .string()
      .optional()
      .transform((value) => value ?? "")
      .refine((value) => value === "" || isDateKey(value), "Ngày không hợp lệ."),
  })
  .superRefine((data, ctx) => {
    const timesValid =
      time.safeParse(data.startTime).success && time.safeParse(data.endTime).success;
    if (timesValid && parseTimeToMinutes(data.endTime) <= parseTimeToMinutes(data.startTime)) {
      ctx.addIssue({
        code: "custom",
        message: "Giờ kết thúc phải sau giờ bắt đầu.",
        path: ["endTime"],
      });
    }

    if (!data.repeat) return;
    if (data.repeatDays.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Chọn ít nhất một thứ để lặp lại.",
        path: ["repeatDays"],
      });
    }
    // Date keys are YYYY-MM-DD, so string comparison matches date order.
    if (data.repeatUntil !== "" && isDateKey(data.date) && data.repeatUntil < data.date) {
      ctx.addIssue({
        code: "custom",
        message: "Ngày kết thúc lặp phải từ ngày bắt đầu trở đi.",
        path: ["repeatUntil"],
      });
    }
  })
  .transform(({ repeat, repeatDays, repeatUntil, ...rest }) => ({
    ...rest,
    // One-off events store nulls; repeating ones store the weekdays and optional end date.
    repeatDays: repeat ? repeatDays : null,
    repeatUntil: repeat && repeatUntil !== "" ? repeatUntil : null,
  }));

export type EventFormInput = z.infer<typeof eventFormSchema>;

/** Event ids are UUIDs; checked before they reach a database query. */
export const eventIdSchema = z.uuid();
