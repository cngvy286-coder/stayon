import { z } from "zod";

import { isDateKey, parseTimeToMinutes } from "@/lib/utils/date";
import { EVENT_COLORS } from "@/types/event";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ không hợp lệ.");

/** Fields of the "Thêm lịch" form. Dates and times are in the user's own timezone. */
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
  })
  .refine(
    (data) =>
      !time.safeParse(data.startTime).success ||
      !time.safeParse(data.endTime).success ||
      parseTimeToMinutes(data.endTime) > parseTimeToMinutes(data.startTime),
    { message: "Giờ kết thúc phải sau giờ bắt đầu.", path: ["endTime"] },
  );

export type EventFormInput = z.infer<typeof eventFormSchema>;
