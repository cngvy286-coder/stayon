import type { ReactNode } from "react";

const tones = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-teal-200 bg-teal-50 text-teal-800",
} as const;

export function Alert({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}
    >
      {children}
    </div>
  );
}
