"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { REMINDER_GRACE_MS, type Reminder } from "@/lib/reminders/schedule";

/** How often the list is refreshed while the tab stays open. */
export const REMINDER_REFRESH_MS = 5 * 60 * 1000;
/** localStorage key holding reminders already shown (id -> time shown). */
export const FIRED_STORAGE_KEY = "stayon:fired-reminders";
/** Forget shown reminders after two days. */
const FIRED_TTL_MS = 2 * 24 * 60 * 60 * 1000;
/** setTimeout can't wait longer than ~24.8 days; our horizon is 24 hours anyway. */
const MAX_TIMEOUT_MS = 2_147_483_647;

export type NotificationState = "unknown" | "unsupported" | NotificationPermission;

type FiredMap = Record<string, number>;

function readFired(): FiredMap {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(FIRED_STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as FiredMap) : {};
  } catch {
    return {};
  }
}

/** Remember that `id` was shown. Returns false if it had already been shown (e.g. by another tab). */
function markFired(id: string): boolean {
  const fired = readFired();
  if (fired[id]) return false;
  const now = Date.now();
  for (const key of Object.keys(fired)) {
    if (now - fired[key] > FIRED_TTL_MS) delete fired[key];
  }
  fired[id] = now;
  try {
    localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(fired));
  } catch {
    // Storage full or blocked: the reminder is still shown, it just may repeat after a reload.
  }
  return true;
}

function currentPermission(): NotificationState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/** The permission has no change event we rely on; our own request updates it via state. */
function noopSubscribe() {
  return () => {};
}

/** The user's upcoming reminders, or null when they can't be loaded right now. */
async function fetchReminders(): Promise<Reminder[] | null> {
  try {
    const response = await fetch("/api/reminders", { cache: "no-store" });
    if (!response.ok) return null;
    const body = (await response.json()) as { reminders?: Reminder[] };
    return body.reminders ?? [];
  } catch {
    // Offline or server error: keep the current list and try again later.
    return null;
  }
}

/**
 * Loads the user's upcoming reminders and shows each one at its time while the tab is open:
 * as a system notification when allowed, otherwise as an in-page toast.
 */
export function useReminders() {
  const router = useRouter();
  const pathname = usePathname();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [toasts, setToasts] = useState<Reminder[]>([]);

  // The browser's permission ("unknown" on the server, so server and client HTML match),
  // overridden by the answer to our own request.
  const browserPermission = useSyncExternalStore(
    noopSubscribe,
    currentPermission,
    () => "unknown" as const,
  );
  const [answered, setAnswered] = useState<NotificationPermission | null>(null);
  const permission: NotificationState = answered ?? browserPermission;
  const permissionRef = useRef(permission);
  useEffect(() => {
    permissionRef.current = permission;
  }, [permission]);

  const requestPermission = useCallback(async () => {
    if (currentPermission() === "unsupported") return;
    setAnswered(await Notification.requestPermission());
  }, []);

  // Refresh on page changes (an event or task may have just been saved), every few minutes,
  // and when the user comes back to the tab.
  useEffect(() => {
    let active = true;
    void fetchReminders().then((list) => {
      if (active && list) setReminders(list);
    });
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    const reload = () =>
      void fetchReminders().then((list) => {
        if (list) setReminders(list);
      });
    const interval = setInterval(reload, REMINDER_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const show = useCallback(
    (reminder: Reminder) => {
      if (!markFired(reminder.id)) return;

      if (permissionRef.current === "granted") {
        const notification = new Notification(reminder.title, {
          body: reminder.body,
          tag: reminder.id, // the OS replaces duplicates from other tabs
        });
        notification.onclick = () => {
          window.focus();
          router.push(reminder.href);
          notification.close();
        };
        return;
      }
      setToasts((current) => [...current, reminder]);
    },
    [router],
  );

  // One timer per upcoming reminder; reminders missed by a few minutes are shown right away.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const now = Date.now();
    for (const reminder of reminders) {
      const delay = new Date(reminder.fireAt).getTime() - now;
      if (delay < -REMINDER_GRACE_MS || delay > MAX_TIMEOUT_MS) continue;
      timers.push(setTimeout(() => show(reminder), Math.max(0, delay)));
    }
    return () => timers.forEach(clearTimeout);
  }, [reminders, show]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return { permission, requestPermission, toasts, dismissToast };
}
