import { z } from "zod";

const email = z.email("Email không hợp lệ.");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

export const signUpSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên hiển thị.")
      .max(50, "Tên hiển thị tối đa 50 ký tự."),
    email,
    password: z
      .string()
      .min(8, "Mật khẩu cần ít nhất 8 ký tự.")
      .max(72, "Mật khẩu tối đa 72 ký tự.")
      .regex(/[A-Za-z]/, "Mật khẩu cần có ít nhất 1 chữ cái.")
      .regex(/\d/, "Mật khẩu cần có ít nhất 1 chữ số."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp.",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

/** Field name -> first error message, ready to show under each input. */
export type FieldErrors = Partial<Record<string, string>>;

export function firstFieldErrors(error: z.ZodError): FieldErrors {
  const { fieldErrors } = z.flattenError(error);
  return Object.fromEntries(
    Object.entries(fieldErrors as Record<string, string[] | undefined>)
      .filter(([, messages]) => messages && messages.length > 0)
      .map(([field, messages]) => [field, messages![0]]),
  );
}
