import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tổng quan" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
      <p className="mt-1 text-ink-muted">
        Lịch hôm nay, công việc và tiến độ của bạn sẽ hiện ở đây.
      </p>
      <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-10 text-center text-brand-700">
        Bảng điều khiển đang được xây dựng
      </div>
    </div>
  );
}
