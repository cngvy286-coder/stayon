"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Icon } from "@/components/ui/Icon";
import type { Reminder } from "@/lib/reminders/schedule";

/** How long an in-page reminder stays before hiding itself. */
export const TOAST_DURATION_MS = 30_000;

type ReminderToastsProps = {
  toasts: Reminder[];
  onDismiss: (id: string) => void;
};

/** In-page reminders (bottom corner) for when system notifications aren't allowed. */
export function ReminderToasts({ toasts, onDismiss }: ReminderToastsProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-end gap-2 p-4 sm:left-auto sm:w-96"
    >
      {toasts.map((toast) => (
        <ReminderToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ReminderToast({ toast, onDismiss }: { toast: Reminder; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-xl shadow-brand-900/10"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
        <Icon name="bell" className="size-5" />
      </span>
      <Link href={toast.href} onClick={() => onDismiss(toast.id)} className="min-w-0 flex-1">
        <p className="font-semibold">{toast.title}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{toast.body}</p>
      </Link>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Đóng nhắc nhở"
        className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-brand-50 hover:text-brand-700"
      >
        <Icon name="close" className="size-4" />
      </button>
    </div>
  );
}
