type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

/**
 * Validate the Supabase env vars and return them.
 * Throws a clear error early instead of failing later with a confusing network error.
 */
export function readSupabaseEnv(
  url: string | undefined,
  publishableKey: string | undefined,
): SupabaseEnv {
  if (!url || !publishableKey) {
    throw new Error(
      "Missing Supabase env vars. Copy .env.example to .env.local and set " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  if (!/^https:\/\/[^/]+$/.test(url.replace(/\/$/, ""))) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be the project root URL, e.g. https://xxxx.supabase.co " +
        "(without /rest/v1).",
    );
  }

  if (publishableKey.startsWith("sb_secret_")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is a SECRET key. Never expose it — use the publishable key.",
    );
  }

  return { url: url.replace(/\/$/, ""), publishableKey };
}

export function getSupabaseEnv(): SupabaseEnv {
  // Must reference process.env.NEXT_PUBLIC_* literally so Next.js can inline them in the browser bundle.
  return readSupabaseEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
