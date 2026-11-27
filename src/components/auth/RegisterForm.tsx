"use client";

import Link from "next/link";
import { useActionState } from "react";

import { type AuthFormState, signUp } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

const initialState: AuthFormState = { status: "idle" };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="success">{state.message}</Alert>
        <p className="text-center text-sm text-ink-muted">
          Đã xác nhận xong?{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {state.message && <Alert tone="error">{state.message}</Alert>}

      <FormField
        name="displayName"
        label="Tên hiển thị"
        autoComplete="nickname"
        placeholder="VD: Minh Anh"
        maxLength={50}
        defaultValue={state.values?.displayName}
        error={state.fieldErrors?.displayName}
        required
      />
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
        autoComplete="new-password"
        hint="Ít nhất 8 ký tự, có cả chữ và số."
        error={state.fieldErrors?.password}
        required
      />
      <FormField
        name="confirmPassword"
        label="Nhập lại mật khẩu"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
        required
      />

      <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
        {pending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
