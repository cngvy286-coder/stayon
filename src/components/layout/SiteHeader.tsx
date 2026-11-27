import { ButtonLink } from "@/components/ui/ButtonLink";

import { Logo } from "./Logo";

/** Header for public pages (landing, auth). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line/70 bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <a
            href="#features"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:text-brand-700 sm:block"
          >
            Tính năng
          </a>
          <ButtonLink href="/login" variant="ghost">
            Đăng nhập
          </ButtonLink>
          <ButtonLink href="/register">Bắt đầu</ButtonLink>
        </nav>
      </div>
    </header>
  );
}
