import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:px-6">
        <Logo />
        <p>© 2026 STAYON. Giữ nhịp mỗi ngày.</p>
      </div>
    </footer>
  );
}
