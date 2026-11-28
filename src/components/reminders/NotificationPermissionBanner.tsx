"use client";

import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { NotificationState } from "@/hooks/useReminders";

export const BANNER_DISMISSED_KEY = "stayon:notification-banner-dismissed";

function readDismissed() {
  try {
    return localStorage.getItem(BANNER_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function noopSubscribe() {
  return () => {};
}

type NotificationPermissionBannerProps = {
  permission: NotificationState;
  onRequest: () => void;
};

/**
 * Asks once for notification permission. "Để sau" hides it for good on this browser;
 * when permission was denied it explains how to turn it back on.
 */
export function NotificationPermissionBanner({
  permission,
  onRequest,
}: NotificationPermissionBannerProps) {
  // Hidden on the server (no localStorage there), so server and client HTML match.
  const dismissedBefore = useSyncExternalStore(noopSubscribe, readDismissed, () => true);
  const [dismissedNow, setDismissedNow] = useState(false);
  const dismissed = dismissedBefore || dismissedNow;

  const dismiss = () => {
    setDismissedNow(true);
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, "1");
    } catch {
      // Ignore: the banner just comes back next visit.
    }
  };

  if (dismissed || (permission !== "default" && permission !== "denied")) return null;

  return (
    <div
      role="region"
      aria-label="Thông báo nhắc nhở"
      className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center"
    >
      <Icon name="bell" className="hidden size-5 shrink-0 text-amber-600 sm:block" />
      {permission === "default" ? (
        <>
          <p className="flex-1">
            <span className="font-semibold">Bật thông báo</span> để STAYON nhắc bạn trước giờ học và
            hạn chót, kể cả khi bạn đang ở tab khác.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={dismiss}>
              Để sau
            </Button>
            <Button onClick={onRequest}>Bật thông báo</Button>
          </div>
        </>
      ) : (
        <>
          <p className="flex-1">
            Thông báo đang bị chặn. Bấm biểu tượng ổ khóa cạnh địa chỉ trang → <b>Thông báo</b> →{" "}
            <b>Cho phép</b>, rồi tải lại trang. Trong lúc đó, nhắc nhở sẽ hiện ngay trong trang.
          </p>
          <Button variant="ghost" onClick={dismiss}>
            Đã hiểu
          </Button>
        </>
      )}
    </div>
  );
}
