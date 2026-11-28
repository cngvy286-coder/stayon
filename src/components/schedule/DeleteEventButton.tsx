"use client";

import { useState, useTransition } from "react";

import { deleteEvent } from "@/app/(app)/schedule/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

/** "Xóa lịch" with an inline two-step confirmation (no browser confirm() dialog). */
export function DeleteEventButton({
  eventId,
  onDeleted,
}: {
  eventId: string;
  onDeleted: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteEvent(eventId);
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
        Xóa lịch
      </Button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
      {error && <Alert tone="error">{error}</Alert>}
      <p className="text-sm font-medium text-rose-800">Xóa lịch này? Không thể hoàn tác.</p>
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
