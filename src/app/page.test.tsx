import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Landing page", () => {
  it("renders the main heading", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Giữ nhịp học tập và làm việc",
    );
  });

  it("shows the four core features", () => {
    render(<Home />);

    for (const title of [
      "Thời khóa biểu",
      "Công việc & tiến độ",
      "Nhắc nhở đúng lúc",
      "Chế độ tập trung",
    ]) {
      expect(screen.getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
    }
  });

  it("links the sign-up and sign-in buttons", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: /Bắt đầu miễn phí/ })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/login");
  });
});
