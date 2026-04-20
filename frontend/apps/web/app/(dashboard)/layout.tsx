import { AppSidebar } from "@/app/(dashboard)/components/app-sidebar"
import { SiteHeader } from "@/app/(dashboard)/components/site-header"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { NotificationListener } from "@/components/notification-listener"
import { ReactNode } from "react"

export default function Page({ children }: { children: ReactNode }) {
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
        {children}
      </SidebarInset>
      <NotificationListener />
    </SidebarProvider>
  )
}
