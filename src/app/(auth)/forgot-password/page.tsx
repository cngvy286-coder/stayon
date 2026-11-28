import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Quên mật khẩu" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Quên mật khẩu?</h1>
      <p className="mt-1 mb-6 text-ink-muted">
        Nhập email bạn đã đăng ký, STAYON sẽ gửi link để đặt mật khẩu mới.
      </p>
      <ForgotPasswordForm />
    </>
  );
}
