/** Pages that need a signed-in user. Keep in sync with the (app) route group. */
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/schedule",
  "/tasks",
  "/reminders",
  "/focus",
  "/settings",
  // Needs the temporary session created by the password-reset email link.
  "/reset-password",
] as const;

/** Pages only for signed-out users. */
export const AUTH_PAGES = ["/login", "/register", "/forgot-password"] as const;

export const DEFAULT_SIGNED_IN_PATH = "/dashboard";

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => matches(pathname, prefix));
}

export function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((page) => matches(pathname, page));
}

/**
 * Only allow redirects to paths on this site (blocks open redirects such as
 * "//evil.com" or "https://evil.com").
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return DEFAULT_SIGNED_IN_PATH;
  }
  return next;
}

/**
 * Where the proxy should send this request, or null to let it through.
 * `search` is the original query string (e.g. "?week=2") so it survives the round trip.
 */
export function getAuthRedirect(pathname: string, search: string, isSignedIn: boolean) {
  if (!isSignedIn && isProtectedPath(pathname)) {
    return `/login?next=${encodeURIComponent(pathname + search)}`;
  }
  if (isSignedIn && isAuthPage(pathname)) {
    return DEFAULT_SIGNED_IN_PATH;
  }
  return null;
}
