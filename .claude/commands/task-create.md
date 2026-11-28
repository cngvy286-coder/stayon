---
description: Bước 1/3 — Lập kế hoạch cho một task trong docs/plan.md, tạo docs/tasks/<id>.md rồi DỪNG chờ duyệt
argument-hint: <task-id, vd. 2.4>
---

Lập kế hoạch cho task **$ARGUMENTS** theo quy trình `task-create → task-start → task-done`.

1. Đọc `CLAUDE.md`, `AGENTS.md`, dòng của task $ARGUMENTS trong `docs/plan.md`, và phần code liên quan.
   Nếu không có task $ARGUMENTS trong `docs/plan.md`, hỏi lại người dùng và dừng.
2. Đứng trên `main` đã cập nhật (`git switch main && git pull --ff-only`). **Chưa tạo nhánh.**
3. Tạo file `docs/tasks/$ARGUMENTS.md` theo mẫu sau (viết tiếng Việt, ngắn gọn, cụ thể):

   ```markdown
   # Task <id>: <tên task>

   **Trạng thái:** 📝 Đã lên kế hoạch · **Độ lớn:** S/M/L · **Nhánh:** (tạo ở task-start) · **PR:** —

   ## Mục tiêu
   ## Phạm vi
   - Làm: ...
   - Không làm (để task khác): ...
   ## Cách làm
   ## File dự kiến tạo / sửa
   ## Tiêu chí hoàn thành
   ## Cách kiểm tra
   - Tự động: lint, typecheck, test (test nào mới), build
   - Bạn thử trên trình duyệt: các bước cụ thể
   ## Cần bạn làm / rủi ro
   ## Kết quả
   _(điền ở task-done)_
   ```

4. **Không viết code.** Tóm tắt kế hoạch cho người dùng bằng tiếng Việt và hỏi:
   duyệt thì gõ `/task-start $ARGUMENTS`, muốn sửa kế hoạch thì nói phần cần sửa.
