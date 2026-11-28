"use client";

import { useActionState, useEffect } from "react";

import { createTask, type TaskFormState } from "@/app/(app)/tasks/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { TASK_PRIORITIES } from "@/types/task";

import { PRIORITY_STYLES } from "./taskLabels";

const initialState: TaskFormState = { status: "idle" };

type TaskFormProps = {
  onCancel: () => void;
  /** Called once the task has been saved. */
  onSaved: () => void;
};

/** Form for creating a task; saved by the createTask Server Action. */
export function TaskForm({ onCancel, onSaved }: TaskFormProps) {
  const [state, formAction, pending] = useActionState(createTask, initialState);
  const values = state.values;
  const errors = state.fieldErrors;
  const selectedPriority = values?.priority ?? "medium";

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state, onSaved]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {state.message && <Alert tone="error">{state.message}</Alert>}

      <FormField
        name="title"
        label="Tên việc"
        placeholder="VD: Nộp báo cáo môn Web"
        maxLength={200}
        autoComplete="off"
        defaultValue={values?.title}
        error={errors?.title}
        required
      />

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">
          Hạn chót <span className="font-normal text-ink-muted">(không bắt buộc)</span>
        </legend>
        <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3">
          <FormField
            name="dueDate"
            label="Ngày"
            type="date"
            defaultValue={values?.dueDate}
            error={errors?.dueDate}
          />
          <FormField
            name="dueTime"
            label="Giờ"
            type="time"
            hint="Trống = 23:59"
            defaultValue={values?.dueTime}
            error={errors?.dueTime}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">Độ ưu tiên</legend>
        <div className="flex flex-wrap gap-2">
          {TASK_PRIORITIES.map((priority) => (
            <label key={priority} className="cursor-pointer">
              <input
                type="radio"
                name="priority"
                value={priority}
                defaultChecked={priority === selectedPriority}
                className="peer sr-only"
              />
              <span
                className={`inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-semibold ring-1 transition-shadow peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 ${PRIORITY_STYLES[priority].badge}`}
              >
                {PRIORITY_STYLES[priority].label}
              </span>
            </label>
          ))}
        </div>
        {errors?.priority && <p className="text-sm text-rose-600">{errors.priority}</p>}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="task-note" className="text-sm font-medium">
          Ghi chú <span className="font-normal text-ink-muted">(không bắt buộc)</span>
        </label>
        <textarea
          id="task-note"
          name="note"
          rows={3}
          maxLength={1000}
          placeholder="VD: Gửi qua email cho thầy trước 17h"
          defaultValue={values?.note}
          aria-invalid={errors?.note ? true : undefined}
          className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-ink outline-none placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
        {errors?.note && <p className="text-sm text-rose-600">{errors.note}</p>}
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Hủy
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu việc"}
        </Button>
      </div>
    </form>
  );
}
