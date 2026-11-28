/**
 * Single-value meter: a brand-coloured fill on a light track.
 * The value itself is printed next to it by the caller, so the bar never carries text.
 */
export function ProgressBar({ percent, label }: { percent: number; label: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className="h-2 overflow-hidden rounded-full bg-brand-100"
    >
      {/* Width is the data value, so it has to be an inline style. */}
      <div
        className="h-full rounded-full bg-brand-600 transition-[width] duration-500 motion-reduce:transition-none"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
