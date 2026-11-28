import type { TaskPriority, TaskStatus } from "@/types/task";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Cần làm",
  doing: "Đang làm",
  done: "Xong",
};

/** Label and badge classes per priority (literal class names so Tailwind detects them). */
export const PRIORITY_STYLES: Record<TaskPriority, { label: string; badge: string }> = {
  high: { label: "Cao", badge: "bg-rose-50 text-rose-700 ring-rose-200" },
  medium: { label: "Vừa", badge: "bg-amber-50 text-amber-800 ring-amber-200" },
  low: { label: "Thấp", badge: "bg-slate-100 text-slate-600 ring-slate-200" },
};
