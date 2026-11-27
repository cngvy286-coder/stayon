import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RegisterForm } from "./RegisterForm";

// The real Server Action talks to Supabase; the form only needs a function to call.
vi.mock("@/app/(auth)/actions", () => ({ signUp: vi.fn() }));

describe("RegisterForm", () => {
  it("renders every field with an accessible label", () => {
    render(<RegisterForm />);

    for (const label of ["Tên hiển thị", "Email", "Mật khẩu", "Nhập lại mật khẩu"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByLabelText("Mật khẩu")).toHaveAttribute("type", "password");
  });

  it("links to the sign-in page", () => {
    render(<RegisterForm />);

    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/login");
  });
});
