/**
 * Map Supabase Auth error codes to Vietnamese messages for users.
 * Codes: https://supabase.com/docs/guides/auth/debugging/error-codes
 */
const MESSAGES: Record<string, string> = {
  invalid_credentials: "Email hoặc mật khẩu không đúng.",
  email_not_confirmed: "Bạn chưa xác nhận email. Hãy mở hộp thư và bấm vào link xác nhận.",
  user_already_exists: "Email này đã được đăng ký. Hãy đăng nhập.",
  email_exists: "Email này đã được đăng ký. Hãy đăng nhập.",
  weak_password: "Mật khẩu quá yếu. Hãy dùng mật khẩu dài hơn, có cả chữ và số.",
  over_email_send_rate_limit: "Đã gửi quá nhiều email. Vui lòng thử lại sau ít phút.",
  over_request_rate_limit: "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
  signup_disabled: "Hiện tạm thời không thể đăng ký tài khoản mới.",
  email_address_invalid: "Email không hợp lệ.",
};

export const GENERIC_AUTH_ERROR = "Có lỗi xảy ra. Vui lòng thử lại.";

export function authErrorMessage(code: string | undefined): string {
  return (code && MESSAGES[code]) || GENERIC_AUTH_ERROR;
}

/** Messages for the ?error= param that /auth/callback redirects to /login with. */
export const CALLBACK_ERRORS: Record<string, string> = {
  link_expired: "Link xác nhận đã hết hạn hoặc đã được dùng. Hãy đăng nhập hoặc đăng ký lại.",
  link_invalid: "Link xác nhận không hợp lệ. Hãy mở lại link mới nhất trong email.",
};
