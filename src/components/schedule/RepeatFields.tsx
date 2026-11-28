"use client";

import { useRef, useState } from "react";

import { FormField } from "@/components/ui/FormField";
import { isDateKey, isoWeekday, isoWeekdayLabel } from "@/lib/utils/date";
import { ISO_WEEKDAYS } from "@/types/event";

const WEEKDAY_NAMES = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ nhật"];

type RepeatFieldsProps = {
  /** "on" when the event already repeats. */
  defaultRepeat?: string;
  /** ISO weekdays joined by commas, e.g. "1,3". */
  defaultDays?: string;
  defaultUntil?: string;
  errors?: { repeatDays?: string; repeatUntil?: string };
};

function parseDays(value: string | undefined) {
  return new Set((value ?? "").split(",").filter(Boolean).map(Number));
}

/**
 * "Lặp lại hàng tuần" checkbox; when ticked, weekday toggles (T2 … CN) and an optional end date.
 * Sends repeat=on, one repeatDays=<1..7> per ticked weekday, and repeatUntil.
 */
export function RepeatFields({
  defaultRepeat,
  defaultDays,
  defaultUntil,
  errors,
}: RepeatFieldsProps) {
  const ref = useRef<HTMLFieldSetElement>(null);
  const [repeat, setRepeat] = useState(defaultRepeat === "on");
  const [days, setDays] = useState(() => parseDays(defaultDays));

  const toggleRepeat = (checked: boolean) => {
    setRepeat(checked);
    if (checked && days.size === 0) {
      // Pre-select the weekday of the date currently chosen in the form.
      const dateInput = ref.current?.form?.elements.namedItem("date");
      const date = dateInput instanceof HTMLInputElement ? dateInput.value : "";
      if (isDateKey(date)) setDays(new Set([isoWeekday(date)]));
    }
  };

  const toggleDay = (day: number) => {
    setDays((current) => {
      const next = new Set(current);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  return (
    <fieldset ref={ref} className="flex flex-col gap-3">
      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
        <input
          type="checkbox"
          name="repeat"
          checked={repeat}
          onChange={(event) => toggleRepeat(event.target.checked)}
          className="size-4 accent-brand-600"
        />
        Lặp lại hàng tuần
      </label>

      {repeat && (
        <div className="flex flex-col gap-3 rounded-xl bg-brand-50/60 p-3">
          <div className="flex flex-col gap-1.5">
            <span id="repeat-days-label" className="text-sm font-medium">
              Các thứ trong tuần
            </span>
            <div
              role="group"
              aria-labelledby="repeat-days-label"
              aria-describedby={errors?.repeatDays ? "repeat-days-error" : undefined}
              className="flex flex-wrap gap-1.5"
            >
              {ISO_WEEKDAYS.map((day) => (
                <label key={day} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="repeatDays"
                    value={day}
                    checked={days.has(day)}
                    onChange={() => toggleDay(day)}
                    aria-label={WEEKDAY_NAMES[day - 1]}
                    className="peer sr-only"
                  />
                  <span className="grid h-9 min-w-10 place-items-center rounded-lg border border-line bg-surface px-2 text-sm font-semibold text-ink-muted transition-colors peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500">
                    {isoWeekdayLabel(day)}
                  </span>
                </label>
              ))}
            </div>
            {errors?.repeatDays && (
              <p id="repeat-days-error" className="text-sm text-rose-600">
                {errors.repeatDays}
              </p>
            )}
          </div>

          <FormField
            name="repeatUntil"
            label="Lặp đến ngày"
            type="date"
            hint="Để trống nếu lặp mãi."
            defaultValue={defaultUntil}
            error={errors?.repeatUntil}
          />
        </div>
      )}
    </fieldset>
  );
}
