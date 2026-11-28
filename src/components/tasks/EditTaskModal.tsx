"use client";

import { useMemo } from "react";

import { deleteTask, updateTask } from "@/app/(app)/tasks/actions";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { Modal } from "@/components/ui/Modal";
import { taskToFormValues } from "@/lib/tasks/taskFormValues";
import type { Task } from "@/types/task";

import { TaskForm } from "./TaskForm";

type EditTaskModalProps = {
  task: Task;
  timeZone: string;
  open: boolean;
  onClose: () => void;
};

/** "Sửa việc" modal: the shared task form pre-filled, plus a confirmed delete button. */
export function EditTaskModal({ task, timeZone, open, onClose }: EditTaskModalProps) {
  const save = useMemo(() => updateTask.bind(null, task.id), [task.id]);

  return (
    <Modal open={open} onClose={onClose} title="Sửa việc">
      <div className="flex flex-col gap-4">
        <TaskForm
          action={save}
          initialValues={taskToFormValues(task, timeZone)}
          submitLabel="Lưu thay đổi"
          onCancel={onClose}
          onSaved={onClose}
        />
        <div className="border-t border-line pt-4">
          <ConfirmDeleteButton
            label="Xóa việc"
            question="Xóa việc này? Không thể hoàn tác."
            onConfirm={() => deleteTask(task.id)}
            onDeleted={onClose}
          />
        </div>
      </div>
    </Modal>
  );
}
