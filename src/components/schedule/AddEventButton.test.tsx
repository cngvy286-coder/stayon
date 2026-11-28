import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AddEventButton } from "./AddEventButton";

// The real Server Action talks to Supabase; tests decide what it returns.
const { createEvent } = vi.hoisted(() => ({ createEvent: vi.fn() }));
vi.mock("@/app/(app)/schedule/actions", () => ({ createEvent }));

beforeEach(() => {
  createEvent.mockReset();
});

describe("AddEventButton saving", () => {
  it("shows errors returned by the server and keeps what the user typed", async () => {
    createEvent.mockResolvedValue({
      status: "error",
      fieldErrors: { endTime: "Giờ kết thúc phải sau giờ bắt đầu." },
      values: {
        title: "Toán",
        date: "2026-11-25",
        startTime: "10:00",
        endTime: "09:00",
        color: "rose",
        note: "",
      },
    });
    const user = userEvent.setup();
    render(<AddEventButton defaultDate="2026-11-25" />);

    await user.click(screen.getByRole("button", { name: "Thêm lịch" }));
    await user.type(screen.getByLabelText("Tên lịch"), "Toán");
    await user.click(screen.getByRole("button", { name: "Lưu lịch" }));

    expect(await screen.findByText("Giờ kết thúc phải sau giờ bắt đầu.")).toBeInTheDocument();
    expect(screen.getByLabelText("Tên lịch")).toHaveValue("Toán");
    expect(screen.getByRole("radio", { name: "Hồng" })).toBeChecked();
    expect(createEvent).toHaveBeenCalledTimes(1);
  });

  it("closes the form once the event is saved", async () => {
    createEvent.mockResolvedValue({ status: "success" });
    const user = userEvent.setup();
    render(<AddEventButton defaultDate="2026-11-25" />);

    await user.click(screen.getByRole("button", { name: "Thêm lịch" }));
    await user.type(screen.getByLabelText("Tên lịch"), "Toán");
    await user.click(screen.getByRole("button", { name: "Lưu lịch" }));

    await vi.waitFor(() => expect(screen.queryByLabelText("Tên lịch")).not.toBeInTheDocument());
    const formData = createEvent.mock.calls[0][1] as FormData;
    expect(formData.get("title")).toBe("Toán");
    expect(formData.get("date")).toBe("2026-11-25");
  });
});

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
