import React, { ReactNode } from "react"
import { BottomNav } from "./components/bottom-nav"
import { SiteHeader } from "@/app/(dashboard)/components/site-header"
import { AppSidebar } from "@/app/(dashboard)/components/app-sidebar"
import { NotificationListener } from "@/components/notification-listener"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

export default function WorkerLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav />
        <NotificationListener />
      </SidebarInset>
    </SidebarProvider>
  )
}
