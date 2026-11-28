import { REMINDER_MINUTES, reminderOptionLabel } from "@/lib/reminders";

type ReminderSelectProps = {
  /** Unique id so two forms on one page don't clash. */
  id: string;
  /** "" for no reminder, otherwise minutes as a string. */
  defaultValue?: string;
  error?: string;
  hint?: string;
};

/** "Nhắc trước" select shared by the event and task forms (field name: remindBefore). */
export function ReminderSelect({ id, defaultValue = "", error, hint }: ReminderSelectProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        Nhắc trước
      </label>
      <select
        id={id}
        name="remindBefore"
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-11 cursor-pointer rounded-xl border bg-surface px-3 text-ink outline-none focus:ring-4 ${
          error
            ? "border-rose-400 focus:ring-rose-100"
            : "border-line focus:border-brand-400 focus:ring-brand-100"
        }`}
      >
        <option value="">Không nhắc</option>
        {REMINDER_MINUTES.map((minutes) => (
          <option key={minutes} value={String(minutes)}>
            {reminderOptionLabel(minutes)}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
