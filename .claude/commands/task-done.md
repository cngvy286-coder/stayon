---
description: Bước 3/3 — Kiểm tra lại, ghi kết quả, commit, push, mở Pull Request cho task
argument-hint: <task-id, vd. 2.4>
---

Hoàn tất task **$ARGUMENTS**.

1. Đang ở đúng nhánh của task (xem mục **Nhánh** trong `docs/tasks/$ARGUMENTS.md`).
2. Chạy lại `npm run format`, `lint`, `typecheck`, `test`, `build`. Có lỗi thì sửa; không báo xong khi chưa pass.
3. Điền mục **Kết quả** trong file task: thay đổi chính, số test và kết quả, ghi chú.
   Đổi **Trạng thái:** 🔍 Chờ duyệt.
4. Commit (Conventional Commits, kèm dòng `Co-Authored-By` theo hướng dẫn của hệ thống), push nhánh,
   mở Pull Request vào `main` bằng `gh pr create` (mô tả tiếng Anh: What this adds / Test plan).
   Ghi link PR vào mục **PR** trong file task, commit + push thay đổi đó.
5. Cập nhật roadmap https://claude.ai/artifact/QswPT8MgfiJ98qXwmGsZDx: task $ARGUMENTS → "chờ bạn thử" + link PR.
6. Hướng dẫn người dùng thử từng bước (tiếng Việt). **Không merge** cho tới khi người dùng bảo merge.
   Khi được bảo merge: tick test plan trong PR, `gh pr merge --merge --delete-branch`, về `main`,
   `git pull`, roadmap → "Xong", rồi gợi ý `/task-create <task tiếp theo>`.
