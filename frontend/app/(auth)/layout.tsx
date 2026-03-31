import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="h-screen w-full overflow-hidden bg-card">{children}</div>
    </div>
  );
}
