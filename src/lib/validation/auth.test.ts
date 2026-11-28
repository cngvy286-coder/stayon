import { describe, expect, it } from "vitest";

import {
  firstFieldErrors,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "./auth";

describe("forgotPasswordSchema", () => {
  it("requires a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "ban@email.com" }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "sai" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("applies the same password rules as sign-up", () => {
    const result = resetPasswordSchema.safeParse({ password: "abc", confirmPassword: "abc" });
    expect(result.success).toBe(false);
    expect(result.success ? {} : firstFieldErrors(result.error)).toEqual({
      password: "Mật khẩu cần ít nhất 8 ký tự.",
    });
  });

  it("requires matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "matkhau123",
      confirmPassword: "matkhau124",
    });
    expect(result.success ? {} : firstFieldErrors(result.error)).toEqual({
      confirmPassword: "Mật khẩu nhập lại không khớp.",
    });
  });
});

const validSignUp = {
  displayName: "Minh Anh",
  email: "minhanh@example.com",
  password: "matkhau123",
  confirmPassword: "matkhau123",
};

function errorsOf(schema: typeof signUpSchema | typeof signInSchema, input: unknown) {
  const result = schema.safeParse(input);
  return result.success ? {} : firstFieldErrors(result.error);
}

describe("signUpSchema", () => {
  it("accepts valid input and trims the display name", () => {
    const result = signUpSchema.parse({ ...validSignUp, displayName: "  Minh Anh  " });
    expect(result.displayName).toBe("Minh Anh");
  });

  it("requires a display name", () => {
    expect(errorsOf(signUpSchema, { ...validSignUp, displayName: "   " }).displayName).toBe(
      "Vui lòng nhập tên hiển thị.",
    );
  });

  it("rejects an invalid email", () => {
    expect(errorsOf(signUpSchema, { ...validSignUp, email: "abc" }).email).toBe(
      "Email không hợp lệ.",
    );
  });

  it.each([
    ["short1", "Mật khẩu cần ít nhất 8 ký tự."],
    ["12345678", "Mật khẩu cần có ít nhất 1 chữ cái."],
    ["abcdefgh", "Mật khẩu cần có ít nhất 1 chữ số."],
  ])("rejects weak password %s", (password, message) => {
    expect(
      errorsOf(signUpSchema, { ...validSignUp, password, confirmPassword: password }).password,
    ).toBe(message);
  });

  it("requires matching passwords", () => {
    expect(
      errorsOf(signUpSchema, { ...validSignUp, confirmPassword: "khac12345" }).confirmPassword,
    ).toBe("Mật khẩu nhập lại không khớp.");
  });
});

describe("signInSchema", () => {
  it("requires email and password", () => {
    const errors = errorsOf(signInSchema, { email: "", password: "" });
    expect(errors.email).toBe("Email không hợp lệ.");
    expect(errors.password).toBe("Vui lòng nhập mật khẩu.");
  });
});
