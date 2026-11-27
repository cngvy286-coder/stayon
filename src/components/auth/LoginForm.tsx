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
  const searchParams = useSearchParams();
  const callbackError = CALLBACK_ERRORS[searchParams.get("error") ?? ""];
  const message = state.message ?? (state.status === "idle" ? callbackError : undefined);
  // Set by src/proxy.ts when a signed-out user opens an app page.
  const next = searchParams.get("next");

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {message && <Alert tone="error">{message}</Alert>}
      {next && <input type="hidden" name="next" value={next} />}

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
      <Link
        href="/forgot-password"
        className="-mt-2 self-end text-sm font-medium text-brand-700 hover:underline"
      >
        Quên mật khẩu?
      </Link>

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
