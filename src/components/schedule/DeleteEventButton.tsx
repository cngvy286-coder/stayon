"use client";

import { deleteEvent } from "@/app/(app)/schedule/actions";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";

/**
 * "Xóa lịch" with an inline two-step confirmation.
 * For a repeating event the whole series is deleted, and the wording says so.
 */
export function DeleteEventButton({
  eventId,
  repeating = false,
  onDeleted,
}: {
  eventId: string;
  repeating?: boolean;
  onDeleted: () => void;
}) {
  return (
    <ConfirmDeleteButton
      label={repeating ? "Xóa cả chuỗi lịch" : "Xóa lịch"}
      question={
        repeating
          ? "Xóa tất cả các buổi của lịch lặp này? Không thể hoàn tác."
          : "Xóa lịch này? Không thể hoàn tác."
      }
      onConfirm={() => deleteEvent(eventId)}
      onDeleted={onDeleted}
    />
  );
}
