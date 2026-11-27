import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Đăng ký" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Tạo tài khoản STAYON</h1>
      <p className="mt-1 mb-6 text-ink-muted">Miễn phí. Chỉ mất chưa tới một phút.</p>
      <RegisterForm />
    </>
  );
}
