import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AddEventButton } from "./AddEventButton";

describe("AddEventButton", () => {
  it("opens the new-event form with the given date pre-filled", async () => {
    const user = userEvent.setup();
    render(<AddEventButton defaultDate="2026-11-25" />);

    expect(screen.queryByLabelText("Tên lịch")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Thêm lịch" }));

    expect(screen.getByRole("heading", { name: "Thêm lịch mới" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tên lịch")).toBeInTheDocument();
    expect(screen.getByLabelText("Ngày")).toHaveValue("2026-11-25");
    expect(screen.getByLabelText("Bắt đầu")).toHaveValue("08:00");
    expect(screen.getByLabelText("Kết thúc")).toHaveValue("09:00");
    expect(screen.getByRole("radio", { name: "Chàm" })).toBeChecked();
  });

  it("closes the form with the cancel button", async () => {
    const user = userEvent.setup();
    render(<AddEventButton defaultDate="2026-11-25" />);

    await user.click(screen.getByRole("button", { name: "Thêm lịch" }));
    await user.click(screen.getByRole("button", { name: "Hủy" }));

    expect(screen.queryByLabelText("Tên lịch")).not.toBeInTheDocument();
  });

  it("closes the form with the close (X) button", async () => {
    const user = userEvent.setup();
    render(<AddEventButton defaultDate="2026-11-25" />);

    await user.click(screen.getByRole("button", { name: "Thêm lịch" }));
    await user.click(screen.getByRole("button", { name: "Đóng" }));

    expect(screen.queryByLabelText("Tên lịch")).not.toBeInTheDocument();
  });
});
