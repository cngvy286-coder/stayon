# STAYON

> Website quản lý thời gian và lịch trình thông minh, giúp bạn **giữ nhịp học tập và làm việc mỗi ngày**.

STAYON cho phép người dùng lập thời khóa biểu, đặt nhắc nhở, theo dõi tiến độ công việc và **chặn các website gây xao nhãng theo khung giờ**, để rèn tính kỷ luật và nâng cao hiệu suất.

🚧 **Trạng thái:** đang phát triển (MVP). Xem lộ trình chi tiết trong [docs/plan.md](docs/plan.md).

## Tính năng

| Tính năng | Mô tả | Trạng thái |
|---|---|---|
| Landing page & layout | Giao diện responsive, tiếng Việt | ✅ Xong |
| Đăng ký / đăng nhập | Supabase Auth, xác nhận email, quên mật khẩu, bảo vệ route | ✅ Xong |
| Thời khóa biểu | Lịch tuần, thêm / sửa / xóa, lịch lặp lại hàng tuần | ✅ Xong |
| Công việc & tiến độ | Danh sách task, % hoàn thành | ⏳ Đang làm |
| Nhắc nhở | Thông báo trên trình duyệt | 📋 Kế hoạch |
| Chế độ tập trung | Chrome Extension chặn website theo khung giờ | 📋 Kế hoạch |

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS 4
- **Backend & Database:** Supabase (PostgreSQL + Row Level Security)
- **Authentication:** Supabase Auth (`@supabase/ssr`)
- **Testing:** Vitest, React Testing Library
- **Code quality:** ESLint, Prettier
- **Deployment:** Vercel + Supabase Cloud

## Chạy trên máy local

Yêu cầu: Node.js LTS, npm và một project [Supabase](https://supabase.com) (gói Free).

```bash
# 1. Cài thư viện
npm install

# 2. Tạo file môi trường rồi điền Project URL và Publishable key của Supabase
cp .env.example .env.local

# 3. Chạy dev server tại http://localhost:3000
npm run dev
```

## Scripts

| Lệnh | Chức năng |
|---|---|
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` | Build production |
| `npm run lint` | Kiểm tra code với ESLint |
| `npm run typecheck` | Kiểm tra kiểu TypeScript |
| `npm run test` | Chạy unit test |
| `npm run format` | Format code với Prettier |

## Cấu trúc thư mục

```
src/
├── app/            # Routes (App Router): landing, (auth), (app)
├── components/     # ui/ dùng chung, layout/, và component theo tính năng
├── lib/supabase/   # Supabase client cho browser và server
├── hooks/          # Custom React hooks
└── types/          # Kiểu TypeScript dùng chung
supabase/migrations # Schema database + RLS policies
extension/          # Chrome Extension cho chế độ tập trung
docs/               # Kế hoạch & tài liệu
```
