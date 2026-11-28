---
description: Bước 2/3 — Tạo nhánh và làm task theo kế hoạch đã duyệt trong docs/tasks/<id>.md
argument-hint: <task-id, vd. 2.4>
---

Bắt đầu làm task **$ARGUMENTS**. Người dùng gõ lệnh này nghĩa là đã duyệt kế hoạch.

1. Đọc `docs/tasks/$ARGUMENTS.md`. Nếu chưa có, làm bước `/task-create $ARGUMENTS` trước rồi dừng.
2. Từ `main` mới nhất (`git switch main && git pull --ff-only`), tạo nhánh theo Conventional Commits:
   `feat/<slug>`, `fix/<slug>` hoặc `chore/<slug>`. Các file chưa commit (vd. file task) đi theo sang nhánh.
3. Cập nhật file task: **Trạng thái:** 🚧 Đang làm, **Nhánh:** `<tên nhánh>`.
   Cập nhật roadmap https://claude.ai/artifact/QswPT8MgfiJ98qXwmGsZDx: task $ARGUMENTS → "Đang làm".
4. Làm **đúng phạm vi** trong file task, theo `CLAUDE.md` (tra tài liệu Next 16 trong
   `node_modules/next/dist/docs/` khi viết code Next.js). Việc ngoài phạm vi: ghi vào mục
   "Cần bạn làm / rủi ro" và hỏi, không tự làm.
5. Viết test cho phần mới. Chạy `npm run format`, `lint`, `typecheck`, `test`, `build` và sửa đến khi pass.
   Thử nhanh trên localhost:3000 những gì kiểm tra được mà không cần tài khoản của người dùng.
6. Báo người dùng (tiếng Việt): đã làm gì, kết quả kiểm tra. Gợi ý xem code rồi gõ `/task-done $ARGUMENTS`.
   **Chưa commit / push.**
