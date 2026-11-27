import type { ComponentProps } from "react";

type FormFieldProps = ComponentProps<"input"> & {
  name: string;
  label: string;
  error?: string;
  hint?: string;
};

/** Labelled input with an error/hint line, wired up for screen readers. */
export function FormField({ name, label, error, hint, className = "", ...props }: FormFieldProps) {
  const id = props.id ?? name;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-11 rounded-xl border bg-surface px-3.5 text-ink transition-colors outline-none placeholder:text-ink-muted/60 focus:ring-4 ${
          error
            ? "border-rose-400 focus:ring-rose-100"
            : "border-line focus:border-brand-400 focus:ring-brand-100"
        } ${className}`}
        {...props}
      />
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
