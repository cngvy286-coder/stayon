"use client";

import { useReminders } from "@/hooks/useReminders";

import { NotificationPermissionBanner } from "./NotificationPermissionBanner";
import { ReminderToasts } from "./ReminderToast";

/**
 * Runs reminders for the signed-in area (while a STAYON tab is open):
 * the permission banner at the top of the page and in-page reminder toasts.
 */
export function ReminderCenter() {
  const { permission, requestPermission, toasts, dismissToast } = useReminders();

  return (
    <>
      <NotificationPermissionBanner
        permission={permission}
        onRequest={() => void requestPermission()}
      />
      <ReminderToasts toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
