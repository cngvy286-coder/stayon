import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CalendarEvent } from "@/types/event";

import { EditableEvent } from "./EditableEvent";

// The real Server Actions talk to Supabase; tests decide what they return.
const { updateEvent, deleteEvent } = vi.hoisted(() => ({
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}));
vi.mock("@/app/(app)/schedule/actions", () => ({ updateEvent, deleteEvent }));

const VN = "Asia/Ho_Chi_Minh";
const event: CalendarEvent = {
  id: "8b0f6d4e-3c2a-4f1b-9a7e-1d2c3b4a5f60",
  title: "Thử lưu lịch",
  note: "Phòng A2",
  start_at: "2026-11-28T03:00:00.000Z", // 10:00 in Vietnam
  end_at: "2026-11-28T04:30:00.000Z", // 11:30 in Vietnam
  color: "rose",
  repeat_days: null,
  repeat_until: null,
  remind_before_minutes: null,
};

function renderEvent(overrides: Partial<CalendarEvent> = {}) {
  render(
    <EditableEvent event={{ ...event, ...overrides }} timeZone={VN} label="Sửa lịch: Thử lưu lịch">
      Thử lưu lịch
    </EditableEvent>,
  );
  return userEvent.setup();
}

beforeEach(() => {
  updateEvent.mockReset();
  deleteEvent.mockReset();
});

describe("EditableEvent", () => {
  it("opens the edit form pre-filled in the user's timezone", async () => {
    const user = renderEvent();

    await user.click(screen.getByRole("button", { name: "Sửa lịch: Thử lưu lịch" }));

    expect(screen.getByRole("heading", { name: "Sửa lịch" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tên lịch")).toHaveValue("Thử lưu lịch");
    expect(screen.getByLabelText("Ngày")).toHaveValue("2026-11-28");
    expect(screen.getByLabelText("Bắt đầu")).toHaveValue("10:00");
    expect(screen.getByLabelText("Kết thúc")).toHaveValue("11:30");
    expect(screen.getByRole("radio", { name: "Hồng" })).toBeChecked();
    expect(screen.getByLabelText(/Ghi chú/)).toHaveValue("Phòng A2");
    expect(screen.getByRole("button", { name: "Lưu thay đổi" })).toBeEnabled();
  });

  it("saves through updateEvent bound to the event id and closes", async () => {
    updateEvent.mockResolvedValue({ status: "success" });
    const user = renderEvent();

    await user.click(screen.getByRole("button", { name: "Sửa lịch: Thử lưu lịch" }));
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await vi.waitFor(() => expect(screen.queryByLabelText("Tên lịch")).not.toBeInTheDocument());
    expect(updateEvent.mock.calls[0][0]).toBe(event.id);
  });

  it("asks for confirmation before deleting and does nothing on 'Không'", async () => {
    const user = renderEvent();

    await user.click(screen.getByRole("button", { name: "Sửa lịch: Thử lưu lịch" }));
    await user.click(screen.getByRole("button", { name: "Xóa lịch" }));

    expect(screen.getByText("Xóa lịch này? Không thể hoàn tác.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Không" }));

    expect(deleteEvent).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Xóa lịch" })).toBeInTheDocument();
  });

  it("deletes after confirmation and closes", async () => {
    deleteEvent.mockResolvedValue({ ok: true });
    const user = renderEvent();

    await user.click(screen.getByRole("button", { name: "Sửa lịch: Thử lưu lịch" }));
    await user.click(screen.getByRole("button", { name: "Xóa lịch" }));
    await user.click(screen.getByRole("button", { name: "Xóa" }));

    expect(deleteEvent).toHaveBeenCalledWith(event.id);
    await vi.waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Sửa lịch" })).not.toBeInTheDocument(),
    );
  });

  it("shows the error and stays open when deleting fails", async () => {
    deleteEvent.mockResolvedValue({ ok: false, message: "Không xóa được lịch. Vui lòng thử lại." });
    const user = renderEvent();

    await user.click(screen.getByRole("button", { name: "Sửa lịch: Thử lưu lịch" }));
    await user.click(screen.getByRole("button", { name: "Xóa lịch" }));
    await user.click(screen.getByRole("button", { name: "Xóa" }));

    expect(await screen.findByText("Không xóa được lịch. Vui lòng thử lại.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sửa lịch" })).toBeInTheDocument();
  });

  it("only offers deleting for an event that runs past midnight", async () => {
    const user = renderEvent({
      start_at: "2026-11-28T15:00:00Z", // 22:00 in Vietnam
      end_at: "2026-11-28T18:00:00Z", // 01:00 the next day
    });

    await user.click(screen.getByRole("button", { name: "Sửa lịch: Thử lưu lịch" }));

    expect(screen.getByText(/kéo dài qua nửa đêm/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Tên lịch")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa lịch" })).toBeInTheDocument();
  });

  describe("repeating events", () => {
    const repeating = { repeat_days: [1, 3], repeat_until: null };

    it("shows the series' repeat settings and says edits apply to every occurrence", async () => {
      const user = renderEvent(repeating);

      await user.click(screen.getByRole("button", { name: "Sửa lịch: Thử lưu lịch" }));

      expect(screen.getByText(/áp dụng cho tất cả các buổi/)).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: "Lặp lại hàng tuần" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Thứ Hai" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Thứ Tư" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Thứ Ba" })).not.toBeChecked();
    });

    it("deletes the whole series after a series-specific confirmation", async () => {
      deleteEvent.mockResolvedValue({ ok: true });
      const user = renderEvent(repeating);

      await user.click(screen.getByRole("button", { name: "Sửa lịch: Thử lưu lịch" }));
      await user.click(screen.getByRole("button", { name: "Xóa cả chuỗi lịch" }));

      expect(screen.getByText(/Xóa tất cả các buổi của lịch lặp này/)).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Xóa" }));
      expect(deleteEvent).toHaveBeenCalledWith(event.id);
    });

    it("sends the chosen weekdays when saving", async () => {
      updateEvent.mockResolvedValue({ status: "success" });
      const user = renderEvent(repeating);

      await user.click(screen.getByRole("button", { name: "Sửa lịch: Thử lưu lịch" }));
      await user.click(screen.getByRole("checkbox", { name: "Thứ Sáu" }));
      await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

      await vi.waitFor(() => expect(updateEvent).toHaveBeenCalled());
      const formData = updateEvent.mock.calls[0][2] as FormData;
      expect(formData.get("repeat")).toBe("on");
      expect(formData.getAll("repeatDays")).toEqual(["1", "3", "5"]);
    });
  });
});
