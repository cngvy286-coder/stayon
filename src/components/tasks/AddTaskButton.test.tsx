import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AddTaskButton } from "./AddTaskButton";

// The real Server Action talks to Supabase; tests decide what it returns.
const { createTask } = vi.hoisted(() => ({ createTask: vi.fn() }));
vi.mock("@/app/(app)/tasks/actions", () => ({ createTask }));

beforeEach(() => {
  createTask.mockReset();
});

async function openForm() {
  const user = userEvent.setup();
  render(<AddTaskButton />);
  await user.click(screen.getByRole("button", { name: "Thêm việc" }));
  return user;
}

describe("AddTaskButton", () => {
  it("opens an empty form with medium priority selected", async () => {
    await openForm();

    expect(screen.getByRole("heading", { name: "Thêm việc mới" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tên việc")).toHaveValue("");
    expect(screen.getByLabelText("Ngày")).toHaveValue("");
    expect(screen.getByLabelText("Giờ")).toHaveValue("");
    expect(screen.getByRole("radio", { name: "Vừa" })).toBeChecked();
  });

  it("sends the typed values and closes once saved", async () => {
    createTask.mockResolvedValue({ status: "success" });
    const user = await openForm();

    await user.type(screen.getByLabelText("Tên việc"), "Nộp báo cáo");
    await user.click(screen.getByRole("radio", { name: "Cao" }));
    await user.click(screen.getByRole("button", { name: "Lưu việc" }));

    await vi.waitFor(() => expect(screen.queryByLabelText("Tên việc")).not.toBeInTheDocument());
    const formData = createTask.mock.calls[0][1] as FormData;
    expect(formData.get("title")).toBe("Nộp báo cáo");
    expect(formData.get("priority")).toBe("high");
    expect(formData.get("dueDate")).toBe("");
  });

  it("shows server errors and keeps what the user typed", async () => {
    createTask.mockResolvedValue({
      status: "error",
      fieldErrors: { dueDate: "Chọn ngày cho hạn chót (hoặc xóa giờ)." },
      values: { title: "Nộp báo cáo", note: "", dueDate: "", dueTime: "17:00", priority: "low" },
    });
    const user = await openForm();

    await user.type(screen.getByLabelText("Tên việc"), "Nộp báo cáo");
    await user.click(screen.getByRole("button", { name: "Lưu việc" }));

    expect(await screen.findByText("Chọn ngày cho hạn chót (hoặc xóa giờ).")).toBeInTheDocument();
    expect(screen.getByLabelText("Tên việc")).toHaveValue("Nộp báo cáo");
    expect(screen.getByLabelText("Giờ")).toHaveValue("17:00");
    expect(screen.getByRole("radio", { name: "Thấp" })).toBeChecked();
  });

  it("closes with the cancel button", async () => {
    const user = await openForm();

    await user.click(screen.getByRole("button", { name: "Hủy" }));

    expect(screen.queryByLabelText("Tên việc")).not.toBeInTheDocument();
  });
});
