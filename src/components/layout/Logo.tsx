import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-bold tracking-tight text-ink">
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm text-white"
      >
        S
      </span>
      <span className="text-lg">STAYON</span>
    </Link>
  );
}
