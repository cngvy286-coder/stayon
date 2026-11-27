import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getAuthRedirect } from "@/lib/auth/routes";

import { getSupabaseEnv } from "./env";

/**
 * Runs on every page request (from src/proxy.ts):
 * 1. Refreshes the Supabase session and writes the new auth cookies.
 * 2. Redirects signed-out users away from app pages, and signed-in users away from /login.
 *
 * This is an optimistic check for fast redirects. Code that reads private data must still
 * check the user on the server; RLS in the database is the final guard.
 */
export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not run code between createServerClient and getClaims(): it would make
  // random sign-outs hard to debug. getClaims() verifies the JWT signature.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  const target = getAuthRedirect(pathname, search, isSignedIn);
  if (!target) {
    return response;
  }

  const redirect = NextResponse.redirect(new URL(target, request.url));
  // Keep any refreshed auth cookies on the redirect response too.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
