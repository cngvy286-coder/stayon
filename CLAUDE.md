# CLAUDE.md — STAYON

## 1. Tổng quan dự án

**STAYON** là website quản lý thời gian và lịch trình thông minh. Người dùng có thể:

- Lập **thời khóa biểu** (sự kiện theo ngày/tuần, có thể lặp lại).
- Thiết lập **nhắc nhở** trước sự kiện/công việc.
- Quản lý **công việc (task)** và theo dõi **tiến độ**.
- **Kiểm soát truy cập website** theo khung giờ (Focus mode) để hạn chế xao nhãng.

Đối tượng: mọi người dùng phổ thông, nên giao diện phải đơn giản, rõ ràng, dùng tốt trên cả desktop lẫn mobile.
Ngôn ngữ giao diện: **tiếng Việt**.

> Lưu ý kiến trúc: một website **không thể tự chặn website khác** trong trình duyệt. Tính năng chặn web cần một
> **Chrome Extension (Manifest V3)** đồng bộ luật chặn từ Supabase. Web app chỉ quản lý luật (domain + khung giờ).

## 2. Tech stack

| Lớp | Công nghệ |
|---|---|
| Frontend | Next.js (App Router) + React + TypeScript (strict) |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (qua `@supabase/ssr`) |
| Test | Vitest + React Testing Library (unit), Playwright (e2e, giai đoạn sau) |
| Deploy | Vercel (web), Supabase Cloud (DB/Auth), GitHub (mã nguồn) |
| Runtime | Node.js LTS, npm, Google Chrome |

> **Next.js 16** có nhiều thay đổi phá vỡ tương thích so với các bản trước (vd. `middleware.ts` → `proxy.ts`, Cache Components).
> Đọc và làm theo [AGENTS.md](AGENTS.md): tra tài liệu trong `node_modules/next/dist/docs/` trước khi viết code Next.js.

## 3. Cấu trúc thư mục

```
.
├── src/
│   ├── app/                    # Routes (App Router)
│   │   ├── (auth)/             # login, register, forgot-password
│   │   ├── (app)/              # Khu vực đã đăng nhập: dashboard, schedule, tasks, reminders, focus, settings
│   │   ├── api/                # Route handlers (chỉ khi Server Actions không phù hợp)
│   │   ├── layout.tsx
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # Component dùng chung: Button, Input, Modal...
│   │   ├── layout/             # Header, Sidebar, Footer
│   │   └── <feature>/          # Component theo tính năng: schedule/, tasks/, focus/...
│   ├── lib/
│   │   ├── supabase/           # client.ts (browser), server.ts (server), proxy.ts (refresh session)
│   │   └── utils/              # Hàm tiện ích thuần (date, format...)
│   ├── hooks/                  # Custom React hooks (useXxx)
│   ├── types/                  # Kiểu TypeScript dùng chung + database.types.ts (generate từ Supabase)
│   └── proxy.ts                # Refresh session + bảo vệ route (Next 16: thay cho middleware.ts)
├── supabase/
│   └── migrations/             # File SQL migration (schema + RLS)
├── extension/                  # Chrome Extension chặn web (giai đoạn sau)
├── public/                     # Ảnh, icon tĩnh
├── tests/                      # Test e2e (Playwright)
├── docs/                       # Tài liệu: plan.md, ghi chú thiết kế
├── .env.example                # Mẫu biến môi trường (KHÔNG chứa secret thật)
└── .env.local                  # Secret thật — không commit
```

## 4. Lệnh thường dùng

```bash
npm install          # Cài thư viện
npm run dev          # Chạy localhost: http://localhost:3000
npm run build        # Build production (phải pass trước khi deploy)
npm run start        # Chạy bản build ở local
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest (unit test)
npm run format       # Prettier
```

Trước khi báo một task là xong: `npm run lint`, `npm run typecheck`, `npm run test` và `npm run build` đều phải pass.

## 5. Quy tắc đặt tên & code conventions

**Đặt tên**
- Component: `PascalCase.tsx` (vd. `AddEventButton.tsx`). Mỗi file một component chính.
- Hook: `useCamelCase.ts` (vd. `useTasks.ts`).
- Utils, lib: `camelCase.ts`.
- Thư mục route: `kebab-case` (vd. `forgot-password/`).
- Biến/hàm: `camelCase`; hằng số: `UPPER_SNAKE_CASE`; type/interface: `PascalCase`.
- Database: bảng `snake_case` số nhiều (`events`, `tasks`, `block_rules`), cột `snake_case`.
- Định danh trong code viết bằng **tiếng Anh**; text hiển thị cho người dùng viết bằng **tiếng Việt**.

**Code**
- TypeScript `strict`, không dùng `any` (dùng `unknown` rồi thu hẹp kiểu).
- Mặc định dùng **Server Components**; chỉ thêm `"use client"` khi cần state, effect hoặc sự kiện trình duyệt.
- Ghi dữ liệu ưu tiên **Server Actions**; validate input bằng **Zod**.
- Chỉ style bằng Tailwind, không dùng inline style hay file CSS riêng (trừ `globals.css`).
- Import bằng alias `@/` (vd. `@/components/ui/Button`).
- Mọi bảng Supabase **bắt buộc bật RLS** và có policy giới hạn theo `auth.uid()`.
- Thay đổi schema chỉ qua file mới trong `supabase/migrations/`.
- Thời gian lưu trong DB dạng `timestamptz` (UTC), chỉ đổi sang giờ địa phương khi hiển thị.
- Commit message theo Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

## 6. Những điều Claude tuyệt đối KHÔNG tự ý làm

1. **Không deploy** (Vercel, `supabase db push` lên cloud, hay bất kỳ môi trường production nào) khi chưa được đồng ý.
2. **Không phát sinh chi phí**: không nâng gói trả phí, không bật add-on hay dịch vụ có tính tiền. Chỉ dùng gói free.
3. **Không `git commit` / `git push`** hay tạo repo GitHub khi chưa được yêu cầu.
4. **Không đọc, in ra hay sửa `.env.local`** và các secret; không dùng `service_role` key ở phía client.
5. **Không sửa migration đã áp dụng**; muốn thay đổi thì tạo migration mới.
6. **Không tắt RLS** hay nới lỏng policy bảo mật.
7. **Không xóa dữ liệu** hay chạy lệnh phá hủy (`DROP`, `TRUNCATE`, `rm -rf`, reset DB) khi chưa được đồng ý.
8. **Không nâng major version** thư viện, không thêm thư viện lớn mới khi chưa hỏi.
9. **Không đổi phạm vi** trong `docs/plan.md` hay sửa file `CLAUDE.md` này khi chưa hỏi.
10. **Không làm vượt phạm vi task**: mỗi lần chỉ làm đúng task đã được duyệt trong `docs/plan.md`.
