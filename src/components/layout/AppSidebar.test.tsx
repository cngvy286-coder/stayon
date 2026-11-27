import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppSidebar } from "./AppSidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

// The real Server Action talks to Supabase; the sidebar only needs a function.
vi.mock("@/app/(auth)/actions", () => ({ signOut: vi.fn() }));

describe("AppSidebar", () => {
  it("marks the current page as active", () => {
    render(<AppSidebar />);

    expect(screen.getByRole("link", { name: "Tổng quan" })).toHaveAttribute("aria-current", "page");
  });

  it("shows features that are not built yet as disabled, not as links", () => {
    render(<AppSidebar />);

    expect(screen.queryByRole("link", { name: /Thời khóa biểu/ })).not.toBeInTheDocument();
    expect(screen.getByText("Thời khóa biểu").closest("[aria-disabled]")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("has a sign-out button that submits a form", () => {
    render(<AppSidebar />);

    const button = screen.getByRole("button", { name: "Đăng xuất" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button.closest("form")).not.toBeNull();
  });
});
