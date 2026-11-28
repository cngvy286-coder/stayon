import type { Metadata } from "next";
import { Suspense } from "react";

import { WeekView } from "@/components/schedule/WeekView";

export const metadata: Metadata = { title: "Thời khóa biểu" };

export default function SchedulePage({ searchParams }: PageProps<"/schedule">) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Thời khóa biểu</h1>
        <p className="mt-1 text-ink-muted">Lịch học và lịch làm của bạn trong tuần.</p>
      </div>

      {/* The week depends on the URL and the signed-in user, so it renders at request time. */}
      <Suspense fallback={<WeekSkeleton />}>
        <WeekFromParams searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function WeekFromParams({ searchParams }: Pick<PageProps<"/schedule">, "searchParams">) {
  const { week } = await searchParams;
  return <WeekView week={week} />;
}

function WeekSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-label="Đang tải lịch">
      <div className="h-9 w-56 rounded-lg bg-brand-100/60" />
      <div className="h-96 rounded-2xl bg-brand-50" />
    </div>
  );
}
