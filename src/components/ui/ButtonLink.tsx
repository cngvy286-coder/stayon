import Link from "next/link";
import type { ComponentProps } from "react";

import { type ButtonSize, type ButtonVariant, buttonClasses } from "./buttonStyles";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** A link styled as a button. */
export function ButtonLink({ variant, size, className = "", ...props }: ButtonLinkProps) {
  return <Link className={`${buttonClasses(variant, size)} ${className}`} {...props} />;
}
