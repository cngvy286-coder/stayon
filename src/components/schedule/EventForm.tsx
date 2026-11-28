"use client";

import { useActionState, useEffect } from "react";

import type { EventFormState } from "@/app/(app)/schedule/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import type { EventFormValues } from "@/lib/schedule/eventFormValues";
import { EVENT_COLORS, type EventColor } from "@/types/event";

import { EVENT_COLOR_CLASSES } from "./eventColors";

const COLOR_LABELS: Record<EventColor, string> = {
  brand: "Chàm",
  teal: "Xanh ngọc",
  amber: "Hổ phách",
  rose: "Hồng",
  sky: "Xanh trời",
};

const initialState: EventFormState = { status: "idle" };

type EventFormProps = {
  /** Server Action that saves the form (createEvent, or updateEvent bound to an id). */
  action: (prev: EventFormState, formData: FormData) => Promise<EventFormState>;
  /** Pre-filled values, e.g. the date for a new event or the whole event when editing. */
  initialValues: Partial<EventFormValues>;
  submitLabel: string;
  onCancel: () => void;
  /** Called once the event has been saved. */
  onSaved: () => void;
};

/** Event fields shared by the "Thêm lịch" and "Sửa lịch" forms. */
export function EventForm({
  action,
  initialValues,
  submitLabel,
  onCancel,
  onSaved,
}: EventFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  // After an error, show what the user typed; otherwise the pre-filled values.
  const values: Partial<Record<string, string>> = state.values ?? initialValues;
  const errors = state.fieldErrors;
  const selectedColor = values?.color ?? "brand";

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state, onSaved]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {state.message && <Alert tone="error">{state.message}</Alert>}

      <FormField
        name="title"
        label="Tên lịch"
        placeholder="VD: Toán cao cấp"
        maxLength={100}
        autoComplete="off"
        defaultValue={values?.title}
        error={errors?.title}
        required
      />

      <FormField
        name="date"
        label="Ngày"
        type="date"
        defaultValue={values?.date}
        error={errors?.date}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          name="startTime"
          label="Bắt đầu"
          type="time"
          defaultValue={values?.startTime ?? "08:00"}
          error={errors?.startTime}
          required
        />
        <FormField
          name="endTime"
          label="Kết thúc"
          type="time"
          defaultValue={values?.endTime ?? "09:00"}
          error={errors?.endTime}
          required
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">Màu</legend>
        <div className="flex flex-wrap gap-2">
          {EVENT_COLORS.map((color) => (
            <label key={color} className="cursor-pointer" title={COLOR_LABELS[color]}>
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={color === selectedColor}
                className="peer sr-only"
                aria-label={COLOR_LABELS[color]}
              />
              <span
                className={`block size-8 rounded-full ring-offset-2 ring-offset-surface peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-brand-500 ${EVENT_COLOR_CLASSES[color].dot}`}
              />
            </label>
          ))}
        </div>
        {errors?.color && <p className="text-sm text-rose-600">{errors.color}</p>}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="note" className="text-sm font-medium">
          Ghi chú <span className="font-normal text-ink-muted">(không bắt buộc)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={1000}
          placeholder="VD: Phòng A2.301, mang máy tính"
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
          {pending ? "Đang lưu..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
