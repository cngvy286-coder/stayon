import { AppSidebar } from "@/components/layout/AppSidebar";

/** Layout for the signed-in area. Route protection is added in Task 1.3 (src/proxy.ts). */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <AppSidebar />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
