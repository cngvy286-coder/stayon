"use client";

import { useState, useTransition } from "react";

import { Alert } from "./Alert";
import { Button } from "./Button";

export type DeleteResult = { ok: true } | { ok: false; message: string };

type ConfirmDeleteButtonProps = {
  /** Text of the first button, e.g. "Xóa lịch". */
  label: string;
  /** Confirmation question, e.g. "Xóa lịch này? Không thể hoàn tác." */
  question: string;
  /** Performs the deletion (usually a Server Action). */
  onConfirm: () => Promise<DeleteResult>;
  /** Called after a successful deletion. */
  onDeleted: () => void;
};

/** Delete button with an inline two-step confirmation (no browser confirm() dialog). */
export function ConfirmDeleteButton({
  label,
  question,
  onConfirm,
  onDeleted,
}: ConfirmDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () => {
    setError(null);
    startTransition(async () => {
      const result = await onConfirm();
      if (result.ok) onDeleted();
      else setError(result.message);
    });
  };

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
        onClick={() => setConfirming(true)}
      >
        {label}
      </Button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
      {error && <Alert tone="error">{error}</Alert>}
      <p className="text-sm font-medium text-rose-800">{question}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setConfirming(false)} disabled={pending}>
          Không
        </Button>
        <Button
          className="bg-rose-600 hover:bg-rose-700"
          onClick={remove}
          disabled={pending}
          autoFocus
        >
          {pending ? "Đang xóa..." : "Xóa"}
        </Button>
      </div>
    </div>
  );
}
