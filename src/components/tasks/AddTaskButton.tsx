"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";

import { TaskForm } from "./TaskForm";

/** "Thêm việc" button that opens the new-task form in a modal. */
export function AddTaskButton() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icon name="plus" className="size-4" />
        Thêm việc
      </Button>
      <Modal open={open} onClose={close} title="Thêm việc mới">
        <TaskForm onCancel={close} onSaved={close} />
      </Modal>
    </>
  );
}
