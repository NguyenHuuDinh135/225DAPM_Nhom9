"use client"

import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { Badge } from "@workspace/ui/components/badge"
import { ModeSwitcher } from "@/components/mode-switcher"
import { useAuth } from "@/hooks/use-auth"

const ROLE_LABELS: Record<string, { label: string; className: string }> = {
  Administrator: { label: "Quản trị viên", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  Manager:       { label: "Quản lý",       className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  Employee:      { label: "Nhân viên",     className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
}

export function SiteHeader() {
  const { user } = useAuth()
  const roleInfo = user?.role ? (ROLE_LABELS[user.role] ?? { label: user.role, className: "" }) : null

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ms-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate max-w-[160px]">
              {user.name ?? user.email}
            </span>
            {roleInfo && (
              <Badge className={`text-xs font-medium border-0 ${roleInfo.className}`}>
                {roleInfo.label}
              </Badge>
            )}
          </div>
        )}
        <div className="ml-auto">
          <ModeSwitcher />
        </div>
      </div>
    </header>
  )
}
