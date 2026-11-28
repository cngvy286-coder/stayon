"use client";

import { useCallback, useState } from "react";

import { createEvent } from "@/app/(app)/schedule/actions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";

import { EventForm } from "./EventForm";

/** "Thêm lịch" button that opens the new-event form in a modal. */
export function AddEventButton({ defaultDate }: { defaultDate: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icon name="plus" className="size-4" />
        Thêm lịch
      </Button>
      <Modal open={open} onClose={close} title="Thêm lịch mới">
        <EventForm
          action={createEvent}
          initialValues={{ date: defaultDate }}
          submitLabel="Lưu lịch"
          onCancel={close}
          onSaved={close}
        />
      </Modal>
    </>
  );
}
