import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/Icon";

type StatTileProps = {
  label: string;
  icon: IconName;
  /** Literal Tailwind classes for the icon chip (Tailwind must see the full names). */
  tone: string;
  /** The headline number or phrase. */
  value: ReactNode;
  /** Secondary line under the value. */
  detail?: ReactNode;
  children?: ReactNode;
};

/** A summary tile: small label, one headline value, an optional detail line. */
export function StatTile({ label, icon, tone, value, detail, children }: StatTileProps) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center gap-2.5">
        <span className={`grid size-8 place-items-center rounded-lg ${tone}`}>
          <Icon name={icon} className="size-4.5" />
        </span>
        <h2 className="text-sm font-medium text-ink-muted">{label}</h2>
      </div>
      <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      {children}
      {detail && <p className="text-sm text-ink-muted">{detail}</p>}
    </section>
  );
}
