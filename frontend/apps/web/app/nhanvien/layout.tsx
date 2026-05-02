import { BottomNav } from "./components/bottom-nav"
import { SiteHeader } from "@/app/(dashboard)/components/site-header"
import { NotificationListener } from "@/components/notification-listener"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { ReactNode } from "react"

export default function WorkerLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="relative flex min-h-screen flex-col w-full bg-slate-50">
        <SiteHeader />
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav />
        <NotificationListener />
      </div>
    </SidebarProvider>
  )
}
