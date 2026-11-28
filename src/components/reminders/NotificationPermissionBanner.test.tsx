import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BANNER_DISMISSED_KEY, NotificationPermissionBanner } from "./NotificationPermissionBanner";

beforeEach(() => {
  localStorage.clear();
});

describe("NotificationPermissionBanner", () => {
  it("asks to turn notifications on", async () => {
    const onRequest = vi.fn();
    const user = userEvent.setup();
    render(<NotificationPermissionBanner permission="default" onRequest={onRequest} />);

    await user.click(await screen.findByRole("button", { name: "Bật thông báo" }));
    expect(onRequest).toHaveBeenCalled();
  });

  it("hides for good after 'Để sau'", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <NotificationPermissionBanner permission="default" onRequest={vi.fn()} />,
    );

    await user.click(await screen.findByRole("button", { name: "Để sau" }));
    expect(screen.queryByRole("region", { name: "Thông báo nhắc nhở" })).not.toBeInTheDocument();
    expect(localStorage.getItem(BANNER_DISMISSED_KEY)).toBe("1");

    unmount();
    render(<NotificationPermissionBanner permission="default" onRequest={vi.fn()} />);
    expect(screen.queryByRole("region", { name: "Thông báo nhắc nhở" })).not.toBeInTheDocument();
  });

  it("explains how to unblock notifications when they were denied", async () => {
    render(<NotificationPermissionBanner permission="denied" onRequest={vi.fn()} />);

    expect(await screen.findByText(/Thông báo đang bị chặn/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Bật thông báo" })).not.toBeInTheDocument();
  });

  it.each(["granted", "unsupported", "unknown"] as const)("shows nothing when %s", (permission) => {
    render(<NotificationPermissionBanner permission={permission} onRequest={vi.fn()} />);
    expect(screen.queryByRole("region", { name: "Thông báo nhắc nhở" })).not.toBeInTheDocument();
  });
});
