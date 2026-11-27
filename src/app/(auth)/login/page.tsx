import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Chào mừng trở lại</h1>
      <p className="mt-1 mb-6 text-ink-muted">Đăng nhập để tiếp tục lịch trình của bạn.</p>
      {/* LoginForm reads ?error= from the URL, which happens at request time. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
