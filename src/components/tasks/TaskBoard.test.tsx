import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Task } from "@/types/task";

import { TaskBoard } from "./TaskBoard";

// The real Server Actions talk to Supabase; tests decide what they return.
const { setTaskStatus, updateTask, deleteTask } = vi.hoisted(() => ({
  setTaskStatus: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));
vi.mock("@/app/(app)/tasks/actions", () => ({ setTaskStatus, updateTask, deleteTask }));

const VN = "Asia/Ho_Chi_Minh";
const NOW = "2026-11-28T03:00:00.000Z"; // 10:00 in Vietnam

const report: Task = {
  id: "8b0f6d4e-3c2a-4f1b-9a7e-1d2c3b4a5f60",
  title: "Nộp báo cáo",
  note: null,
  due_at: "2026-11-29T10:00:00.000Z", // tomorrow 17:00 in Vietnam
  status: "todo",
  priority: "high",
  completed_at: null,
  created_at: "2026-11-27T03:00:00.000Z",
};
const reading: Task = {
  ...report,
  id: "2c1d4f6a-9b8e-4a3d-8c2b-7e6f5a4b3c2d",
  title: "Đọc sách",
  due_at: null,
  priority: "low",
};

/** A promise the test resolves by hand, to look at the UI while a save is in flight. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => (resolve = res));
  return { promise, resolve };
}

const column = (name: string) => screen.getByRole("region", { name: new RegExp(`^${name}`) });

function renderBoard(tasks: Task[] = [report, reading]) {
  render(<TaskBoard tasks={tasks} nowIso={NOW} timeZone={VN} />);
  return userEvent.setup();
}

beforeEach(() => {
  setTaskStatus.mockReset();
  updateTask.mockReset();
  deleteTask.mockReset();
});

describe("TaskBoard status changes", () => {
  it("moves a task to Xong as soon as its checkbox is ticked", async () => {
    const save = deferred<{ ok: true }>();
    setTaskStatus.mockReturnValue(save.promise);
    const user = renderBoard();

    expect(within(column("Cần làm")).getByText("Nộp báo cáo")).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Hoàn thành: Nộp báo cáo" }));

    // Still saving, but already shown as done.
    expect(within(column("Xong")).getByText("Nộp báo cáo")).toBeInTheDocument();
    expect(within(column("Cần làm")).queryByText("Nộp báo cáo")).not.toBeInTheDocument();
    expect(setTaskStatus).toHaveBeenCalledWith(report.id, "done");

    save.resolve({ ok: true });
  });

  it("moves a task back and shows the error when saving fails", async () => {
    setTaskStatus.mockResolvedValue({ ok: false, message: "Không đổi được trạng thái." });
    const user = renderBoard();

    await user.click(screen.getByRole("checkbox", { name: "Hoàn thành: Nộp báo cáo" }));

    expect(await screen.findByText("Không đổi được trạng thái.")).toBeInTheDocument();
    // The optimistic move is undone once the failed save finishes.
    expect(await within(column("Cần làm")).findByText("Nộp báo cáo")).toBeInTheDocument();
  });

  it("changes status with the select", async () => {
    const save = deferred<{ ok: true }>();
    setTaskStatus.mockReturnValue(save.promise);
    const user = renderBoard();

    await user.selectOptions(screen.getByLabelText("Trạng thái: Đọc sách"), "doing");

    expect(within(column("Đang làm")).getByText("Đọc sách")).toBeInTheDocument();
    expect(setTaskStatus).toHaveBeenCalledWith(reading.id, "doing");

    // Always let the save finish: React entangles pending transitions across tests.
    save.resolve({ ok: true });
  });

  it("unticks a done task back to Cần làm", async () => {
    const save = deferred<{ ok: true }>();
    setTaskStatus.mockReturnValue(save.promise);
    const done = { ...report, status: "done" as const, completed_at: NOW };
    const user = renderBoard([done]);

    const checkbox = screen.getByRole("checkbox", { name: "Hoàn thành: Nộp báo cáo" });
    expect(checkbox).toBeChecked();
    await user.click(checkbox);

    expect(within(column("Cần làm")).getByText("Nộp báo cáo")).toBeInTheDocument();
    expect(setTaskStatus).toHaveBeenCalledWith(report.id, "todo");

    save.resolve({ ok: true });
  });
});

describe("TaskBoard edit and delete", () => {
  it("opens the edit form pre-filled in the user's timezone and saves by id", async () => {
    updateTask.mockResolvedValue({ status: "success" });
    const user = renderBoard();

    await user.click(screen.getByRole("button", { name: "Sửa việc: Nộp báo cáo" }));

    expect(screen.getByRole("heading", { name: "Sửa việc" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tên việc")).toHaveValue("Nộp báo cáo");
    expect(screen.getByLabelText("Ngày")).toHaveValue("2026-11-29");
    expect(screen.getByLabelText("Giờ")).toHaveValue("17:00");
    expect(screen.getByRole("radio", { name: "Cao" })).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await vi.waitFor(() => expect(screen.queryByLabelText("Tên việc")).not.toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(updateTask.mock.calls[0][0]).toBe(report.id);
  });

  it("asks before deleting and only deletes after 'Xóa'", async () => {
    deleteTask.mockResolvedValue({ ok: true });
    const user = renderBoard();

    await user.click(screen.getByRole("button", { name: "Sửa việc: Nộp báo cáo" }));
    await user.click(screen.getByRole("button", { name: "Xóa việc" }));
    expect(screen.getByText("Xóa việc này? Không thể hoàn tác.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Không" }));
    expect(deleteTask).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Xóa việc" }));
    await user.click(screen.getByRole("button", { name: "Xóa" }));
    expect(deleteTask).toHaveBeenCalledWith(report.id);
    await vi.waitFor(
      () => expect(screen.queryByRole("heading", { name: "Sửa việc" })).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
