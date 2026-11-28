"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";

import { EventForm } from "./EventForm";

/** "Thêm lịch" button that opens the new-event form in a modal. */
export function AddEventButton({ defaultDate }: { defaultDate: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icon name="plus" className="size-4" />
        Thêm lịch
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Thêm lịch mới">
        <EventForm defaultDate={defaultDate} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  );
}
