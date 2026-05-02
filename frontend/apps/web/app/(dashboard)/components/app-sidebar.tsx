"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon, TreePineIcon, MapIcon, ClipboardListIcon, CheckSquareIcon,
  TriangleAlertIcon, UsersIcon, BarChart3Icon, FileTextIcon,
  SettingsIcon, ChevronRightIcon,
} from "lucide-react"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/hooks/use-auth"
import { getImageUrl } from "@/lib/api-client"

import { Role, ROLES } from "@/lib/roles"

interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  roles?: Role[]
  items?: { title: string; url: string; roles?: Role[] }[]
}

// 1. Menu Chính (Dành cho mọi người hoặc các vai trò quản lý)
const NAV_MAIN: (dashboardUrl: string) => NavItem[] = (dashboardUrl) => [
  { 
    title: "Bàn làm việc", 
    url: dashboardUrl, 
    icon: <LayoutDashboardIcon className="size-4" /> 
  },
  {
    title: "Bản đồ cây xanh", url: "/map", icon: <MapIcon className="size-4" />,
  },
  {
    title: "Quản lý công việc", 
    url: "/nhanvien/tasks", 
    icon: <ClipboardListIcon className="size-4" />,
    roles: [ROLES.NhanVien, ROLES.DoiTruong],
  },
]

// 2. Menu Nghiệp vụ Quản lý (Giám Đốc & Đội Trưởng)
const NAV_MANAGEMENT: NavItem[] = [
  {
    title: "Danh mục cây", url: "/trees", icon: <TreePineIcon className="size-4" />,
    roles: [ROLES.GiamDoc, ROLES.DoiTruong],
  },
  {
    title: "Nhân sự & Đội ngũ", url: "/staff", icon: <UsersIcon className="size-4" />, 
    roles: [ROLES.GiamDoc, ROLES.DoiTruong] 
  },
  {
    title: "Sự cố & Phản hồi", url: "/incidents", icon: <TriangleAlertIcon className="size-4" />,
    roles: [ROLES.GiamDoc, ROLES.DoiTruong],
  },
]

// 3. Menu Kế hoạch & Báo cáo (Phân quyền sâu hơn)
const NAV_STRATEGIC: NavItem[] = [
  {
    title: "Lập & Duyệt Kế hoạch",
    url: "/plans",
    icon: <CheckSquareIcon className="size-4" />,
    roles: [ROLES.GiamDoc, ROLES.DoiTruong]
  },

  { 
    title: "Báo cáo chiến lược", 
    url: "/reports", 
    icon: <FileTextIcon className="size-4" />, 
    roles: [ROLES.GiamDoc] 
  },
  { 
    title: "Phân tích hệ thống", 
    url: "/analytics", 
    icon: <BarChart3Icon className="size-4" />, 
    roles: [ROLES.DoiTruong] 
  },
]

const NAV_SETTINGS: NavItem[] = [
  { title: "Cài đặt tài khoản", url: "/settings", icon: <SettingsIcon className="size-4" /> },
]

function isVisible(item: NavItem, role: Role) {
  return !item.roles || item.roles.includes(role)
}

function NavGroup({ label, items, role, pathname }: { label: string; items: NavItem[]; role: Role; pathname: string }) {
  const visible = items.filter((item) => isVisible(item, role))
  if (visible.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">{label}</SidebarGroupLabel>
      <SidebarMenu>
        {visible.map((item) => {
          const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className={isActive ? "bg-green-50 text-green-700 font-bold" : ""}>
                <Link href={item.url}>{item.icon}<span>{item.title}</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useAuth()
  const role = (user?.role ?? ROLES.NhanVien) as Role

  const dashboardUrl = role === ROLES.GiamDoc ? "/giamdoc" : role === ROLES.DoiTruong ? "/doitruong" : "/nhanvien";

  return (
    <Sidebar collapsible="icon" {...props} className="border-r-slate-100">
      <SidebarHeader className="h-(--header-height) justify-center border-b border-slate-50 px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href={dashboardUrl}>
                <div className="flex size-9 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg shadow-green-600/20">
                  <TreePineIcon className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Cây Xanh ĐN</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Smart Greenery</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-4">
        <NavGroup label="Hệ thống" items={NAV_MAIN(dashboardUrl)} role={role} pathname={pathname} />
        <NavGroup label="Nghiệp vụ" items={NAV_MANAGEMENT} role={role} pathname={pathname} />
        <NavGroup label="Chiến lược" items={NAV_STRATEGIC} role={role} pathname={pathname} />
        <NavGroup label="Cá nhân" items={NAV_SETTINGS} role={role} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-50 p-4">
        <NavUser user={{
          name: user?.name ?? user?.email ?? "Người dùng",
          email: user?.email ?? "",
          avatar: user?.avatarUrl ? getImageUrl(user.avatarUrl) : "",
          role: user?.role
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
