import type { IconName } from "@/components/ui/Icon";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  /** false = feature not built yet; shown as disabled with a "Sắp có" badge. */
  ready: boolean;
};

export const APP_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: "dashboard", ready: true },
  { href: "/schedule", label: "Thời khóa biểu", icon: "calendar", ready: true },
  { href: "/tasks", label: "Công việc", icon: "check", ready: false },
  { href: "/reminders", label: "Nhắc nhở", icon: "bell", ready: false },
  { href: "/focus", label: "Tập trung", icon: "shield", ready: false },
  { href: "/settings", label: "Cài đặt", icon: "settings", ready: false },
];
