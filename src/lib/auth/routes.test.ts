import { describe, expect, it } from "vitest";

import { getAuthRedirect, safeNextPath } from "./routes";

describe("getAuthRedirect", () => {
  it("sends signed-out users from app pages to /login, remembering where they were", () => {
    expect(getAuthRedirect("/dashboard", "", false)).toBe("/login?next=%2Fdashboard");
    expect(getAuthRedirect("/schedule/week", "?d=2", false)).toBe(
      "/login?next=%2Fschedule%2Fweek%3Fd%3D2",
    );
  });

  it("lets signed-out users see public and auth pages", () => {
    for (const path of ["/", "/login", "/register", "/auth/callback"]) {
      expect(getAuthRedirect(path, "", false)).toBeNull();
    }
  });

  it("does not treat look-alike paths as protected", () => {
    expect(getAuthRedirect("/dashboards", "", false)).toBeNull();
  });

  it("sends signed-in users away from /login and /register", () => {
    expect(getAuthRedirect("/login", "", true)).toBe("/dashboard");
    expect(getAuthRedirect("/register", "", true)).toBe("/dashboard");
  });

  it("lets signed-in users through to app pages", () => {
    expect(getAuthRedirect("/dashboard", "", true)).toBeNull();
  });
});

describe("safeNextPath", () => {
  it("keeps internal paths", () => {
    expect(safeNextPath("/tasks?filter=today")).toBe("/tasks?filter=today");
  });

  it.each([null, "", "https://evil.com", "//evil.com", "/\\evil.com", "dashboard"])(
    "falls back to /dashboard for %s",
    (next) => {
      expect(safeNextPath(next)).toBe("/dashboard");
    },
  );
});
