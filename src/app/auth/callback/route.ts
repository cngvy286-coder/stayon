import { type NextRequest, NextResponse } from "next/server";

import { safeNextPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Links in Supabase emails land here with ?code=... :
 * - sign-up confirmation  -> /auth/callback                      -> /dashboard
 * - password reset        -> /auth/callback?next=/reset-password -> /reset-password
 * Exchange the code for a session (sets the auth cookies), then continue to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (searchParams.get("error_code") === "otp_expired") {
    return NextResponse.redirect(`${origin}/login?error=link_expired`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNextPath(searchParams.get("next"))}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link_invalid`);
}
