"use client"

import { usePathname } from "next/navigation"
import { 
  HomeIcon, 
  ClipboardListIcon, 
  MapPinIcon, 
  BellIcon,
  UserCircleIcon,
  CameraIcon
} from "lucide-react"
import LinkNext from "next/link"
import { cn } from "@workspace/ui/lib/utils"

const navItems = [
  { label: "Trang chủ", icon: HomeIcon, href: "/nhanvien" },
  { label: "Công việc", icon: ClipboardListIcon, href: "/nhanvien/tasks" },
  { label: "Bản đồ", icon: "/map", isPublic: true },
  { label: "Thông báo", icon: BellIcon, href: "/nhanvien/notifications" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-3 flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        
        <NavItem 
          href="/nhanvien" 
          icon={HomeIcon} 
          label="Trang chủ" 
          active={pathname === "/nhanvien"} 
        />
        
        <NavItem 
          href="/nhanvien/tasks" 
          icon={ClipboardListIcon} 
          label="Việc làm" 
          active={pathname.includes("/tasks")} 
        />

        {/* Action Button */}
        <div className="relative -mt-12 flex flex-col items-center">
          <LinkNext 
            href="/report-incident"
            className="size-14 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-600/40 active:scale-95 transition-transform"
          >
            <CameraIcon className="size-7" />
          </LinkNext>
          <span className="text-[10px] font-bold text-green-700 mt-2 uppercase tracking-tighter">Báo sự cố</span>
        </div>

        <NavItem 
          href="/map" 
          icon={MapPinIcon} 
          label="Bản đồ" 
          active={pathname === "/map"} 
        />
        
        <NavItem 
          href="/settings" 
          icon={UserCircleIcon} 
          label="Cá nhân" 
          active={pathname === "/settings"} 
        />

      </div>
      
      {/* Safe Area for iPhone */}
      <div className="bg-white h-[env(safe-area-inset-bottom)]" />
    </div>
  )
}

function NavItem({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
  return (
    <LinkNext 
      href={href} 
      className={cn(
        "flex flex-col items-center gap-1 transition-colors",
        active ? "text-green-600" : "text-slate-400"
      )}
    >
      <Icon className={cn("size-6", active && "animate-in zoom-in duration-300")} />
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </LinkNext>
  )
}
