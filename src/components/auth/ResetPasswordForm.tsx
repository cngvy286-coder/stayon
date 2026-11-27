"use client";

import { useActionState } from "react";

import { type AuthFormState, updatePassword } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

const initialState: AuthFormState = { status: "idle" };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {state.message && <Alert tone="error">{state.message}</Alert>}

      <FormField
        name="password"
        label="Mật khẩu mới"
        type="password"
        autoComplete="new-password"
        hint="Ít nhất 8 ký tự, có cả chữ và số."
        error={state.fieldErrors?.password}
        required
      />
      <FormField
        name="confirmPassword"
        label="Nhập lại mật khẩu mới"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
        required
      />

      <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
        {pending ? "Đang lưu..." : "Lưu mật khẩu mới"}
      </Button>
    </form>
  );
}
