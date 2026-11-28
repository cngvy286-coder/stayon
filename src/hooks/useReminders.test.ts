import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Reminder } from "@/lib/reminders/schedule";

import { FIRED_STORAGE_KEY, useReminders } from "./useReminders";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/dashboard",
}));

const NOW = new Date("2026-11-28T10:00:00+07:00");
const minutesFromNow = (minutes: number) =>
  new Date(NOW.getTime() + minutes * 60_000).toISOString();

const reminder = (overrides: Partial<Reminder> = {}): Reminder => ({
  id: "event:e1:x",
  fireAt: minutesFromNow(5),
  title: "Sắp đến: Toán cao cấp",
  body: "10:20 – 11:00 · bắt đầu sau 15 phút",
  href: "/schedule",
  ...overrides,
});

/** Stand-in for the browser Notification API. */
class FakeNotification {
  static permission: NotificationPermission = "granted";
  static requestPermission = vi.fn(async () => FakeNotification.permission);
  static created: FakeNotification[] = [];
  onclick: (() => void) | null = null;
  close = vi.fn();
  constructor(
    public title: string,
    public options: NotificationOptions,
  ) {
    FakeNotification.created.push(this);
  }
}

function serve(reminders: Reminder[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ reminders }), { status: 200 })),
  );
}

/** Mount the hook, let the first fetch settle, then run timers that are already due. */
async function mount() {
  const hook = renderHook(() => useReminders());
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0); // fetch resolves -> reminders state -> timers scheduled
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0); // due-now timers (delay 0) run
  });
  return hook;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  localStorage.clear();
  push.mockReset();
  FakeNotification.permission = "granted";
  FakeNotification.created = [];
  vi.stubGlobal("Notification", FakeNotification);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useReminders", () => {
  it("shows a system notification at the reminder time when allowed", async () => {
    serve([reminder()]);
    const { result } = await mount();
    expect(result.current.permission).toBe("granted");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4 * 60_000);
    });
    expect(FakeNotification.created).toHaveLength(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(FakeNotification.created).toHaveLength(1);
    expect(FakeNotification.created[0].title).toBe("Sắp đến: Toán cao cấp");
    expect(FakeNotification.created[0].options).toMatchObject({
      body: "10:20 – 11:00 · bắt đầu sau 15 phút",
      tag: "event:e1:x",
    });
  });

  it("opens the related page when the notification is clicked", async () => {
    serve([reminder({ fireAt: minutesFromNow(0) })]);
    vi.stubGlobal("focus", vi.fn());
    await mount();

    FakeNotification.created[0].onclick?.();
    expect(push).toHaveBeenCalledWith("/schedule");
    expect(FakeNotification.created[0].close).toHaveBeenCalled();
  });

  it("falls back to an in-page toast when notifications are not allowed", async () => {
    FakeNotification.permission = "default";
    serve([reminder({ fireAt: minutesFromNow(1) })]);
    const { result } = await mount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(FakeNotification.created).toHaveLength(0);
    expect(result.current.toasts.map((t) => t.id)).toEqual(["event:e1:x"]);

    act(() => result.current.dismissToast("event:e1:x"));
    expect(result.current.toasts).toEqual([]);
  });

  it("shows a reminder missed by a few minutes right away", async () => {
    serve([reminder({ fireAt: minutesFromNow(-3) })]);
    await mount();

    expect(FakeNotification.created).toHaveLength(1);
  });

  it("never shows the same reminder twice, even after a reload", async () => {
    serve([reminder({ fireAt: minutesFromNow(0) })]);
    const first = await mount();
    expect(FakeNotification.created).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(FIRED_STORAGE_KEY) ?? "{}")).toHaveProperty(
      "event:e1:x",
    );

    first.unmount();
    await mount();
    expect(FakeNotification.created).toHaveLength(1);
  });

  it("asks for permission and remembers the answer", async () => {
    FakeNotification.permission = "default";
    serve([]);
    const { result } = await mount();
    expect(result.current.permission).toBe("default");

    FakeNotification.permission = "granted";
    await act(async () => {
      await result.current.requestPermission();
    });
    expect(FakeNotification.requestPermission).toHaveBeenCalled();
    expect(result.current.permission).toBe("granted");
  });

  it("reloads the list every 5 minutes", async () => {
    serve([]);
    await mount();
    const fetchMock = vi.mocked(fetch);
    const calls = fetchMock.mock.calls.length;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60_000);
    });
    expect(fetchMock.mock.calls.length).toBe(calls + 1);
  });
});
