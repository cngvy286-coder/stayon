"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/ui/Icon";

import { Logo } from "./Logo";
import { APP_NAV_ITEMS } from "./navItems";

const itemBase =
  "flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium";

/** Navigation for the signed-in area: vertical sidebar on desktop, scrollable top bar on mobile. */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line bg-surface md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Logo href="/dashboard" />
      </div>
      <nav aria-label="Điều hướng chính" className="overflow-x-auto px-2 pb-2 md:px-3">
        <ul className="flex gap-1 md:flex-col">
          {APP_NAV_ITEMS.map((item) => {
            if (!item.ready) {
              return (
                <li key={item.href}>
                  <span
                    aria-disabled="true"
                    className={`${itemBase} cursor-not-allowed text-ink-muted/60`}
                  >
                    <Icon name={item.icon} />
                    {item.label}
                    <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                      Sắp có
                    </span>
                  </span>
                </li>
              );
            }

            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`${itemBase} transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-muted hover:bg-brand-50/60 hover:text-brand-700"
                  }`}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
