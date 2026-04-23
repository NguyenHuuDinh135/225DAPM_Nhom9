"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon, TreePineIcon, MapIcon, ClipboardListIcon, CheckSquareIcon,
  TriangleAlertIcon, ArrowLeftRightIcon, UsersIcon, BarChart3Icon, FileTextIcon,
  SettingsIcon, ShieldIcon, ChevronRightIcon, MessageSquare,
} from "lucide-react"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/hooks/use-auth"

type Role = "Administrator" | "Manager" | "Employee"

interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  roles?: Role[]
  items?: { title: string; url: string; roles?: Role[] }[]
}

const NAV_MAIN: NavItem[] = [
  { title: "Tổng quan", url: "/dashboard", icon: <LayoutDashboardIcon className="size-4" /> },
  {
    title: "Cây xanh", url: "/trees", icon: <TreePineIcon className="size-4" />,
    items: [
      { title: "Tất cả cây", url: "/trees" },
    ],
  },
  { title: "Bản đồ", url: "/map", icon: <MapIcon className="size-4" /> },
  {
    title: "Kế hoạch", url: "/plans", icon: <ClipboardListIcon className="size-4" />,
    roles: ["Manager", "Administrator"],
    items: [
      { title: "Tất cả kế hoạch", url: "/plans" },
    ],
  },
  {
    title: "Công việc", url: "/tasks", icon: <CheckSquareIcon className="size-4" />,
    roles: ["Employee", "Manager"],
    items: [
      { title: "Công việc của tôi", url: "/tasks" },
      { title: "Phân công", url: "/tasks/assign", roles: ["Manager"] },
    ],
  },
  {
    title: "Công tác", url: "/works", icon: <ClipboardListIcon className="size-4" />,
    roles: ["Employee", "Manager", "Administrator"],
    items: [
      { title: "Tất cả công tác", url: "/works" },
      { title: "Phân công", url: "/works/1/assign", roles: ["Manager"] },
      { title: "Tiến độ", url: "/works/1/progress" },
    ],
  },
  {
    title: "Phản hồi", url: "/feedback-inbox", icon: <MessageSquare className="size-4" />,
    roles: ["Manager", "Administrator"],
    items: [
      { title: "Hòm thư góp ý", url: "/feedback-inbox" },
    ],
  },
  {
    title: "Sự cố", url: "/incidents", icon: <TriangleAlertIcon className="size-4" />,
    roles: ["Employee", "Manager", "Administrator"],
    items: [
      { title: "Tất cả sự cố", url: "/incidents" },
      { title: "Báo cáo sự cố", url: "/incidents/report", roles: ["Manager"] },
    ],
  },
  { title: "Thay thế", url: "/replacements", icon: <ArrowLeftRightIcon className="size-4" />, roles: ["Manager"] },
  { title: "Nhân viên", url: "/staff", icon: <UsersIcon className="size-4" />, roles: ["Manager"] },
]

const NAV_REPORTING: NavItem[] = [
  { title: "Phân tích", url: "/analytics", icon: <BarChart3Icon className="size-4" />, roles: ["Administrator"] },
  { title: "Báo cáo", url: "/reports", icon: <FileTextIcon className="size-4" />, roles: ["Manager", "Administrator"] },
]

const NAV_SETTINGS: NavItem[] = [
  { title: "Cài đặt", url: "/settings", icon: <SettingsIcon className="size-4" /> },
  { title: "Quản trị", url: "/settings/admin", icon: <ShieldIcon className="size-4" />, roles: ["Administrator"] },
]

function isVisible(item: NavItem, role: Role) {
  return !item.roles || item.roles.includes(role)
}

function NavGroup({ label, items, role, pathname }: { label: string; items: NavItem[]; role: Role; pathname: string }) {
  const visible = items.filter((item) => isVisible(item, role))
  if (visible.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {visible.map((item) => {
          const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))

          if (!item.items?.length) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link href={item.url}>{item.icon}<span>{item.title}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton isActive={isActive} tooltip={item.title}>
                    {item.icon}<span>{item.title}</span>
                    <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items
                      .filter((sub) => !sub.roles || sub.roles.includes(role))
                      .map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton asChild isActive={pathname === sub.url}>
                            <Link href={sub.url}>{sub.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useAuth()
  const role = (user?.role ?? "Employee") as Role

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex size-8 items-center justify-center rounded-md bg-green-600 text-white">
                  <TreePineIcon className="size-4" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">Cây Xanh Đà Nẵng</span>
                  <span className="text-[10px] text-muted-foreground">Quản lý Cây xanh Đô thị</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Chính" items={NAV_MAIN} role={role} pathname={pathname} />
        <NavGroup label="Báo cáo" items={NAV_REPORTING} role={role} pathname={pathname} />
        <NavGroup label="Hệ thống" items={NAV_SETTINGS} role={role} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={{
          name: user?.name ?? user?.email ?? "Người dùng",
          email: user?.email ?? "",
          avatar: "",
          role: user?.role,
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
