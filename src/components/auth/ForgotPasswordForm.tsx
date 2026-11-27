"use client";

import Link from "next/link";
import { useActionState } from "react";

import { type AuthFormState, requestPasswordReset } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

const initialState: AuthFormState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  const backToLogin = (
    <p className="text-center text-sm text-ink-muted">
      Nhớ ra rồi?{" "}
      <Link href="/login" className="font-semibold text-brand-700 hover:underline">
        Đăng nhập
      </Link>
    </p>
  );

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="success">{state.message}</Alert>
        {backToLogin}
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {state.message && <Alert tone="error">{state.message}</Alert>}

      <FormField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="ban@email.com"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
        required
      />

      <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
        {pending ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
      </Button>

      {backToLogin}
    </form>
  );
}
