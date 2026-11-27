                # Kế hoạch MVP — STAYON

**Kích thước task**
- **S** (nhỏ): 1–2 file, thay đổi ít code. Ví dụ: thêm nút "Thêm lịch".
- **M** (vừa): 3–5 file, có logic hoặc DB.
- **L** (lớn): nhiều file, nhiều tầng (DB + server + UI + bảo mật). Ví dụ: hệ thống đăng nhập.

**Quy trình mỗi task:** làm đúng một task → chạy lint, typecheck, test, build → chạy thử `npm run dev` → người dùng duyệt → sang task tiếp theo.
Các task gắn 👤 cần **bạn tự làm hoặc đồng ý** (tạo tài khoản, deploy...).

---

## Giai đoạn 0 — Khởi tạo & chạy được trên Localhost

| # | Task | Size | File chính | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 0.1 | Khởi tạo Next.js (TS, Tailwind, ESLint, App Router, `src/`, alias `@/`) | S | `package.json`, `src/app/*` | `npm run dev` mở được http://localhost:3000 |
| 0.2 | Thêm Prettier, script `typecheck`, `format` | S | `package.json`, `.prettierrc` | Cả 3 lệnh chạy không lỗi |
| 0.3 | Cài Vitest + React Testing Library, viết 1 test mẫu | S | `vitest.config.ts`, `src/**/*.test.tsx` | `npm run test` pass |
| 0.4 | 👤 Tạo project Supabase (gói **Free**), lấy URL + anon key | S | `.env.local`, `.env.example` | Có đủ biến môi trường, `.env.local` đã nằm trong `.gitignore` |
| 0.5 | Tạo Supabase client (browser + server) bằng `@supabase/ssr` | S | `src/lib/supabase/*` | Gọi thử Supabase không lỗi |
| 0.6 | Layout chung (Header, Sidebar) + landing page | M | `src/components/layout/*`, `src/app/page.tsx` | Giao diện hiển thị tốt trên desktop và mobile |

## Giai đoạn 1 — Hệ thống đăng nhập (L)

| # | Task | Size | File chính | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 1.1 | Migration bảng `profiles` + trigger tự tạo profile khi đăng ký + RLS | M | `supabase/migrations/*` | User chỉ đọc/sửa được profile của mình |
| 1.2 | Trang Đăng ký / Đăng nhập (email + mật khẩu), validate bằng Zod | M | `src/app/(auth)/*`, Server Actions | Đăng ký, đăng nhập thành công; lỗi hiển thị bằng tiếng Việt |
| 1.3 | Proxy (Next 16, thay middleware) refresh session + chặn route `(app)` khi chưa đăng nhập | M | `src/proxy.ts`, `src/lib/supabase/proxy.ts` | Chưa đăng nhập vào `/dashboard` sẽ bị chuyển về `/login` |
| 1.4 | Đăng xuất + Quên mật khẩu / đặt lại mật khẩu | M | `src/app/(auth)/forgot-password/*` | Nhận email đặt lại mật khẩu, đổi được mật khẩu |

## Giai đoạn 2 — Thời khóa biểu

| # | Task | Size | File chính | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 2.1 | Migration bảng `events` (title, start_at, end_at, color, note) + RLS | S | `supabase/migrations/*` | RLS theo `user_id` |
| 2.2 | Trang lịch dạng tuần (chỉ hiển thị) | M | `src/app/(app)/schedule/*`, `components/schedule/*` | Hiện đúng sự kiện của tuần, chuyển được tuần trước/sau |
| 2.3 | **Nút "Thêm lịch"** mở modal form | S | `components/schedule/AddEventButton.tsx` | Bấm nút → modal hiện ra |
| 2.4 | Lưu sự kiện từ form (Server Action) | S | `schedule/actions.ts` | Thêm xong lịch cập nhật ngay |
| 2.5 | Sửa / xóa sự kiện | S | `components/schedule/*` | Sửa/xóa có hỏi xác nhận |
| 2.6 | Sự kiện lặp lại hàng tuần (thời khóa biểu cố định) | M | migration + UI | Môn học lặp lại đúng các thứ đã chọn |

## Giai đoạn 3 — Công việc & tiến độ

| # | Task | Size | File chính | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 3.1 | Migration bảng `tasks` (title, due_at, status, priority) + RLS | S | `supabase/migrations/*` | RLS theo `user_id` |
| 3.2 | Danh sách task + thêm task | M | `src/app/(app)/tasks/*` | Thêm và xem được task |
| 3.3 | Đổi trạng thái (todo / doing / done), sửa, xóa | S | `components/tasks/*` | Trạng thái lưu vào DB |
| 3.4 | Dashboard: % hoàn thành, task hôm nay, sự kiện sắp tới | M | `src/app/(app)/dashboard/*` | Số liệu khớp dữ liệu thật |

## Giai đoạn 4 — Nhắc nhở

| # | Task | Size | File chính | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 4.1 | Thêm trường `remind_before_minutes` cho events/tasks | S | migration + form | Chọn được "nhắc trước 5/15/30 phút" |
| 4.2 | Xin quyền thông báo + nhắc bằng Notifications API khi tab đang mở | M | `hooks/useReminders.ts` | Thông báo hiện đúng giờ |
| 4.3 | (Sau MVP) Web Push qua Service Worker để nhắc cả khi đã đóng tab | L | — | Hoãn lại, bàn sau |

## Giai đoạn 5 — Kiểm soát truy cập website (Focus)

| # | Task | Size | File chính | Tiêu chí hoàn thành |
|---|---|---|---|---|
| 5.1 | Migration bảng `block_rules` (domain, days_of_week, start_time, end_time, enabled) + RLS | S | `supabase/migrations/*` | RLS theo `user_id` |
| 5.2 | Trang quản lý luật chặn (thêm/sửa/xóa/bật-tắt) | M | `src/app/(app)/focus/*` | CRUD hoạt động |
| 5.3 | Chrome Extension MV3: đăng nhập, đồng bộ luật, chặn bằng `declarativeNetRequest` theo khung giờ | L | `extension/*` | Trong khung giờ, mở domain bị chặn sẽ hiện trang "Đang tập trung" |
| 5.4 | Hướng dẫn cài extension ở chế độ Developer (Load unpacked) | S | `docs/extension.md` | Làm theo được từng bước |

## Giai đoạn 6 — Triển khai (chỉ làm khi bạn đồng ý)

| # | Task | Size | Ghi chú |
|---|---|---|---|
| 6.1 | 👤 `git init`, tạo repo GitHub, push code | S | Chỉ làm khi bạn yêu cầu |
| 6.2 | 👤 Kết nối repo với Vercel (gói **Hobby**, miễn phí), khai báo biến môi trường | S | Mỗi lần push lên `main` sẽ tự deploy |
| 6.3 | 👤 Cấu hình Supabase Auth: Site URL + Redirect URLs cho domain Vercel | S | Thiếu bước này đăng nhập trên production sẽ lỗi |
| 6.4 | Kiểm tra lại toàn bộ trên bản production | S | Checklist smoke test |

---

## Hướng dẫn nhanh: cài đặt & chạy thử

```bash
# 1. Cài thư viện
npm install

# 2. Tạo file môi trường từ mẫu rồi điền URL + anon key của Supabase
copy .env.example .env.local     # Windows
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...   (sb_publishable_..., KHÔNG dùng secret key)

# 3. Chạy local
npm run dev                       # mở http://localhost:3000 bằng Chrome

# 4. Kiểm tra trước khi deploy
npm run lint && npm run typecheck && npm run test && npm run build
```

## Ngoài phạm vi MVP (để sau)
Web Push khi đã đóng tab, đăng nhập bằng Google, đồng bộ Google Calendar, thống kê nâng cao, app mobile.
