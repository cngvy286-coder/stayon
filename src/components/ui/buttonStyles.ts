const variants = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700",
  secondary: "border border-line bg-surface text-ink hover:border-brand-300 hover:text-brand-700",
  ghost: "text-ink-muted hover:bg-brand-50 hover:text-brand-700",
} as const;

const sizes = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

/** Shared classes so <Button> and <ButtonLink> always look the same. */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]}`;
}
