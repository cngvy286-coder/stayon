"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authErrorMessage } from "@/lib/auth/errors";
import { safeNextPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import {
  type FieldErrors,
  firstFieldErrors,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth";

export type AuthFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: FieldErrors;
  /** Non-secret values sent back so the form keeps them after an error. */
  values?: { email?: string; displayName?: string };
};

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const values = { email: raw.email };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors(parsed.error), values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { status: "error", message: authErrorMessage(error.code), values };
  }

  // Back to the page the user tried to open (validated to stay on this site).
  // redirect() throws, so it must stay outside any try/catch.
  redirect(safeNextPath(formData.get("next")?.toString()));
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = {
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
  const values = { email: raw.email, displayName: raw.displayName };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors(parsed.error), values };
  }

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Read by the handle_new_user trigger to fill profiles.display_name.
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) {
    return { status: "error", message: authErrorMessage(error.code), values };
  }

  // Email confirmation turned off in Supabase -> already signed in.
  if (data.session) {
    redirect("/dashboard");
  }

  // Supabase returns the same response for an existing email (to hide which emails exist),
  // so the message stays neutral.
  return {
    status: "success",
    message: `Đã gửi email xác nhận tới ${parsed.data.email}. Hãy mở hộp thư (kể cả mục Spam) và bấm vào link để kích hoạt tài khoản.`,
  };
}
