import { describe, expect, it } from "vitest";

import { GENERIC_AUTH_ERROR, authErrorMessage } from "./errors";

describe("authErrorMessage", () => {
  it("translates known Supabase error codes", () => {
    expect(authErrorMessage("invalid_credentials")).toBe("Email hoặc mật khẩu không đúng.");
  });

  it("falls back to a generic message for unknown or missing codes", () => {
    expect(authErrorMessage("something_new")).toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage(undefined)).toBe(GENERIC_AUTH_ERROR);
  });
});
