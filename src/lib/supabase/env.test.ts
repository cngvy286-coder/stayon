import { describe, expect, it } from "vitest";

import { readSupabaseEnv } from "./env";

const URL = "https://abcd.supabase.co";
const KEY = "sb_publishable_test";

describe("readSupabaseEnv", () => {
  it("returns the values when both are valid", () => {
    expect(readSupabaseEnv(URL, KEY)).toEqual({ url: URL, publishableKey: KEY });
  });

  it("strips a trailing slash from the URL", () => {
    expect(readSupabaseEnv(`${URL}/`, KEY).url).toBe(URL);
  });

  it("throws when a value is missing", () => {
    expect(() => readSupabaseEnv(undefined, KEY)).toThrow(/Missing Supabase env vars/);
    expect(() => readSupabaseEnv(URL, "")).toThrow(/Missing Supabase env vars/);
  });

  it("throws when the URL includes an API path", () => {
    expect(() => readSupabaseEnv(`${URL}/rest/v1/`, KEY)).toThrow(/project root URL/);
  });

  it("refuses a secret key", () => {
    expect(() => readSupabaseEnv(URL, "sb_secret_xxx")).toThrow(/SECRET key/);
  });
});
