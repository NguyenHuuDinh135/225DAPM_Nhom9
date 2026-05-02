"use client"

import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { User as UserIcon, LogOutIcon } from "lucide-react"
import { ModeSwitcher } from "@/components/mode-switcher"
import { useAuth } from "@/hooks/use-auth"
import { getImageUrl } from "@/lib/api-client"
import { getRoleLabel } from "@/lib/roles"
import { Button } from "@workspace/ui/components/button"
import { useRouter } from "next/navigation"
import { NotificationPopover } from "@/components/notification-popover"

import { ROLES } from "@/lib/roles"

const BADGE_CLASSES: Record<string, string> = {
  [ROLES.GiamDoc]: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  [ROLES.DoiTruong]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  [ROLES.NhanVien]: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}

import { useSidebar } from "@workspace/ui/components/sidebar"

export function SiteHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }
  
  // Safe sidebar access
  let sidebarTrigger = null
  try {
    const sidebar = useSidebar()
    if (sidebar) {
      sidebarTrigger = (
        <>
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        </>
      )
    }
  } catch (e) {}

  const roleInfo = user?.role ? { label: getRoleLabel(user.role), className: BADGE_CLASSES[user.role] ?? "" } : null

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 glass sticky top-2 z-40 mx-4 rounded-2xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) mt-2 mb-2">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {sidebarTrigger}
        {user && (
          <div className="flex items-center gap-3">
            <Avatar className="size-8 border shadow-xs">
              {user.avatarUrl ? <AvatarImage src={getImageUrl(user.avatarUrl)} className="object-cover" /> : null}
              <AvatarFallback className="bg-green-50 text-green-700">
                <UserIcon className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-bold truncate max-w-[160px] leading-tight">
                {user.name ?? user.email}
              </span>
              {roleInfo && (
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {roleInfo.label}
                </span>
              )}
            </div>
            {roleInfo && (
              <Badge className={`md:hidden text-[10px] h-5 px-1.5 font-bold border-0 ${roleInfo.className}`}>
                {roleInfo.label}
              </Badge>
            )}
          </div>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <NotificationPopover />
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <ModeSwitcher />
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Đăng xuất" className="text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors ml-1">
            <LogOutIcon className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
