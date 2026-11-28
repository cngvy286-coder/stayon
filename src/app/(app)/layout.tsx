import { AppSidebar } from "@/components/layout/AppSidebar";
import { ReminderCenter } from "@/components/reminders/ReminderCenter";

/** Layout for the signed-in area. Route protection is in src/proxy.ts. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <AppSidebar />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
        {/* Reminders run on every app page while the tab is open (Task 4.2). */}
        <ReminderCenter />
        {children}
      </main>
    </div>
  );
}
