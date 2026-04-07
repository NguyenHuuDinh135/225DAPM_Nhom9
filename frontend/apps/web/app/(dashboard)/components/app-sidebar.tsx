"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  TreePineIcon,
  MapIcon,
  ClipboardListIcon,
  CheckSquareIcon,
  TriangleAlertIcon,
  ArrowLeftRightIcon,
  UsersIcon,
  BarChart3Icon,
  FileTextIcon,
  SettingsIcon,
  ShieldIcon,
  ChevronRightIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { NavUser } from "@/components/nav-user"

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "staff" | "team_leader" | "director" | "admin"

interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  /** Roles that can see this item. Omit = visible to all authenticated roles. */
  roles?: Role[]
  items?: { title: string; url: string }[]
}

// ─── Nav definition ───────────────────────────────────────────────────────────

const NAV_MAIN: NavItem[] = [
  {
    title: "Overview",
    url: "/overview",
    icon: <LayoutDashboardIcon className="size-4" />,
  },
  {
    title: "Trees",
    url: "/trees",
    icon: <TreePineIcon className="size-4" />,
    items: [
      { title: "All trees", url: "/trees" },
      { title: "Add tree", url: "/trees/new" },
    ],
  },
  {
    title: "Map",
    url: "/map",
    icon: <MapIcon className="size-4" />,
  },
  {
    title: "Plans",
    url: "/plans",
    icon: <ClipboardListIcon className="size-4" />,
    roles: ["team_leader", "director", "admin"],
    items: [
      { title: "All plans", url: "/plans" },
      { title: "Create plan", url: "/plans/new" },
    ],
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: <CheckSquareIcon className="size-4" />,
    roles: ["staff", "team_leader"],
    items: [
      { title: "My tasks", url: "/tasks" },
      { title: "Assign tasks", url: "/tasks/assign" },
    ],
  },
  {
    title: "Works",
    url: "/works",
    icon: <ClipboardListIcon className="size-4" />,
    roles: ["staff", "team_leader", "admin"],
    items: [
      { title: "Danh sách", url: "/works" },
      { title: "Phân công", url: "/works/1/assign" },
      { title: "Tiến độ", url: "/works/1/progress" },
    ],
  },
  {
    title: "Incidents",
    url: "/incidents",
    icon: <TriangleAlertIcon className="size-4" />,
    roles: ["staff", "team_leader", "admin"],
    items: [
      { title: "Incident list", url: "/incidents" },
      { title: "Report incident", url: "/incidents/report" },
    ],
  },
  {
    title: "Replacements",
    url: "/replacements",
    icon: <ArrowLeftRightIcon className="size-4" />,
    roles: ["team_leader", "admin"],
  },
  {
    title: "Staff",
    url: "/staff",
    icon: <UsersIcon className="size-4" />,
    roles: ["team_leader", "admin"],
  },
]

const NAV_REPORTING: NavItem[] = [
  {
    title: "Analytics",
    url: "/analytics",
    icon: <BarChart3Icon className="size-4" />,
    roles: ["director", "admin"],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: <FileTextIcon className="size-4" />,
    roles: ["team_leader", "director", "admin"],
  },
]

const NAV_SETTINGS: NavItem[] = [
  {
    title: "Settings",
    url: "/settings",
    icon: <SettingsIcon className="size-4" />,
  },
  {
    title: "Admin panel",
    url: "/settings/admin",
    icon: <ShieldIcon className="size-4" />,
    roles: ["admin"],
  },
]

// ─── Mock user — replace with real session / auth context ─────────────────────

const MOCK_USER = {
  name: "Nguyễn Hữu Định",
  email: "dinh@cayxanh.danang.gov.vn",
  avatar: "",
  role: "team_leader" as Role,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isVisible(item: NavItem, role: Role): boolean {
  if (!item.roles) return true
  return item.roles.includes(role)
}

// ─── NavGroup — renders a labeled section with flat + collapsible items ───────

function NavGroup({
  label,
  items,
  role,
  pathname,
}: {
  label: string
  items: NavItem[]
  role: Role
  pathname: string
}) {
  const visible = items.filter((item) => isVisible(item, role))
  if (visible.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {visible.map((item) => {
          const isActive =
            pathname === item.url ||
            (item.url !== "/overview" && pathname.startsWith(item.url))

          // Flat item — no sub-menu
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // Collapsible item — with sub-menu
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton isActive={isActive} tooltip={item.title}>
                    {item.icon}
                    <span>{item.title}</span>
                    <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((sub) => (
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

// ─── AppSidebar ───────────────────────────────────────────────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  // TODO: replace MOCK_USER.role with real session role, e.g. useSession() or an auth context
  const role = MOCK_USER.role

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header — logo + app name */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/overview">
                <div className="flex size-8 items-center justify-center rounded-md bg-green-600 text-white">
                  <TreePineIcon className="size-4" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">Cây Xanh Đà Nẵng</span>
                  <span className="text-[10px] text-muted-foreground">
                    Urban Tree Management
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <NavGroup label="Main" items={NAV_MAIN} role={role} pathname={pathname} />
        <NavGroup label="Reporting" items={NAV_REPORTING} role={role} pathname={pathname} />
        <NavGroup label="System" items={NAV_SETTINGS} role={role} pathname={pathname} />
      </SidebarContent>

      {/* Footer — user info + dropdown */}
      <SidebarFooter>
        <NavUser user={MOCK_USER} />
      </SidebarFooter>
    </Sidebar>
  )
}