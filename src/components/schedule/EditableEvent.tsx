"use client";

import { type CSSProperties, type ReactNode, useCallback, useMemo, useState } from "react";

import { updateEvent } from "@/app/(app)/schedule/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { eventToFormValues } from "@/lib/schedule/eventFormValues";
import { formatDayMonth } from "@/lib/utils/date";
import type { CalendarEvent } from "@/types/event";

import { DeleteEventButton } from "./DeleteEventButton";
import { EventForm } from "./EventForm";

type EditableEventProps = {
  event: CalendarEvent;
  timeZone: string;
  /** Accessible name of the button, e.g. "Sửa lịch: Toán, 07:30 – 09:30". */
  label: string;
  className?: string;
  /** Position of a block in the week grid (computed per event). */
  style?: CSSProperties;
  children: ReactNode;
};

/** Renders an event as a button; clicking it opens the "Sửa lịch" modal. */
export function EditableEvent({
  event,
  timeZone,
  label,
  className,
  style,
  children,
}: EditableEventProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const { spansDays, ...initialValues } = eventToFormValues(event, timeZone);
  const save = useMemo(() => updateEvent.bind(null, event.id), [event.id]);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => setOpen(true)}
        className={`cursor-pointer text-left transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500 ${className ?? ""}`}
        style={style}
      >
        {children}
      </button>

      <Modal open={open} onClose={close} title="Sửa lịch">
        {spansDays ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">{event.title}</span> kéo dài qua nửa đêm (bắt
              đầu {initialValues.startTime} ngày {formatDayMonth(initialValues.date)}). Form hiện
              chưa sửa được lịch qua nhiều ngày, bạn chỉ có thể xóa lịch này.
            </p>
            <div className="flex justify-between gap-2">
              <DeleteEventButton eventId={event.id} onDeleted={close} />
              <Button variant="ghost" onClick={close}>
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <EventForm
              action={save}
              initialValues={initialValues}
              submitLabel="Lưu thay đổi"
              onCancel={close}
              onSaved={close}
            />
            <div className="border-t border-line pt-4">
              <DeleteEventButton eventId={event.id} onDeleted={close} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
