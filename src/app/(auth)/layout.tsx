import { Logo } from "@/components/layout/Logo";

/** Centered card layout for sign-in / sign-up pages. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-brand-900/5 sm:p-8">
        {children}
      </div>
    </main>
  );
}
