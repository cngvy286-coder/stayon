"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

import { type AuthFormState, signIn } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { CALLBACK_ERRORS } from "@/lib/auth/errors";

const initialState: AuthFormState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const callbackError = CALLBACK_ERRORS[useSearchParams().get("error") ?? ""];
  const message = state.message ?? (state.status === "idle" ? callbackError : undefined);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {message && <Alert tone="error">{message}</Alert>}

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
      <FormField
        name="password"
        label="Mật khẩu"
        type="password"
        autoComplete="current-password"
        error={state.fieldErrors?.password}
        required
      />

      <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
