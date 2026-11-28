import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = { title: "Tổng quan" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Greeting, numbers and lists depend on the signed-in user and the current time. */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardView />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-8" aria-label="Đang tải tổng quan">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-64 rounded-lg bg-brand-100/60" />
        <div className="h-5 w-40 rounded-lg bg-brand-50" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-brand-50" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-48 rounded-2xl bg-brand-50" />
        <div className="h-48 rounded-2xl bg-brand-50" />
      </div>
    </div>
  );
}
