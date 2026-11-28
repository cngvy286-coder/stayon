import { z } from "zod";

import { isDateKey } from "@/lib/utils/date";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/types/task";

/** Time used when a deadline has a date but no time: end of that day. */
export const DEFAULT_DUE_TIME = "23:59";

/**
 * Fields of the "Thêm việc" form. The deadline is optional and given in the user's timezone:
 * dueDate "YYYY-MM-DD" or "", dueTime "HH:mm" or "".
 */
export const taskFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên việc.")
      .max(200, "Tên việc tối đa 200 ký tự."),
    note: z
      .string()
      .trim()
      .max(1000, "Ghi chú tối đa 1000 ký tự.")
      .transform((value) => (value === "" ? null : value)),
    dueDate: z
      .string()
      .optional()
      .transform((value) => value ?? "")
      .refine((value) => value === "" || isDateKey(value), "Ngày không hợp lệ."),
    dueTime: z
      .string()
      .optional()
      .transform((value) => value ?? "")
      .refine(
        (value) => value === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(value),
        "Giờ không hợp lệ.",
      ),
    priority: z.enum(TASK_PRIORITIES, "Vui lòng chọn độ ưu tiên."),
  })
  .superRefine((data, ctx) => {
    if (data.dueTime !== "" && data.dueDate === "") {
      ctx.addIssue({
        code: "custom",
        message: "Chọn ngày cho hạn chót (hoặc xóa giờ).",
        path: ["dueDate"],
      });
    }
  })
  .transform(({ dueDate, dueTime, ...rest }) => ({
    ...rest,
    /** null = no deadline. */
    due: dueDate === "" ? null : { date: dueDate, time: dueTime || DEFAULT_DUE_TIME },
  }));

export type TaskFormInput = z.infer<typeof taskFormSchema>;

/** Task ids are UUIDs; checked before they reach a database query. */
export const taskIdSchema = z.uuid();

export const taskStatusSchema = z.enum(TASK_STATUSES);
