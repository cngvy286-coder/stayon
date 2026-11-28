import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Đặt lại mật khẩu" };

/** Reached from the password-reset email via /auth/callback, which signs the user in first. */
export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Đặt mật khẩu mới</h1>
      <p className="mt-1 mb-6 text-ink-muted">Chọn mật khẩu mới cho tài khoản STAYON của bạn.</p>
      <ResetPasswordForm />
    </>
  );
}
