import type { EventColor } from "@/types/event";

/** Full class names per event colour (kept literal so Tailwind can detect them). */
export const EVENT_COLOR_CLASSES: Record<EventColor, { block: string; dot: string }> = {
  brand: { block: "border-brand-500 bg-brand-50 text-brand-900", dot: "bg-brand-500" },
  teal: { block: "border-teal-500 bg-teal-50 text-teal-900", dot: "bg-teal-500" },
  amber: { block: "border-amber-500 bg-amber-50 text-amber-900", dot: "bg-amber-500" },
  rose: { block: "border-rose-500 bg-rose-50 text-rose-900", dot: "bg-rose-500" },
  sky: { block: "border-sky-500 bg-sky-50 text-sky-900", dot: "bg-sky-500" },
};
