import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-muted/30 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border bg-card shadow-sm">
        {children}
      </div>
    </div>
  );
}
