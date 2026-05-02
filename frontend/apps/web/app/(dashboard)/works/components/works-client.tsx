"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@workspace/ui/components/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { UsersIcon, BarChart3Icon, MoreHorizontalIcon, Trash2Icon, EyeIcon } from "lucide-react"
import { CreateWorkDialog } from "./create-work-dialog"
import { WorkSheet } from "./work-sheet"
import type { WorkItem, WorkStatus } from "../page"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { apiClient } from "@/lib/api-client"

const STATUS_CLASSES: Record<WorkStatus, string> = {
  New: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  InProgress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  WaitingForApproval: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

export function WorksClient({ initialWorks }: { initialWorks: WorkItem[] }) {
  const { user } = useAuth()
  const canManage = user?.role === ROLES.DoiTruong
  const canViewDetail = user?.role === ROLES.DoiTruong || user?.role === ROLES.GiamDoc
  const [works, setWorks] = useState<WorkItem[]>(initialWorks)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedWork, setSelectedWork] = useState<WorkItem | undefined>()

  const BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000")

  async function refresh() {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const res = await fetch(`${BASE_URL}/api/work-items`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) {
      const json = await res.json() as { workItems: WorkItem[] }
      setWorks(json.workItems ?? [])
    }
  }

  function handleView(work: WorkItem) {
    setSelectedWork(work)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-w-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Danh sách công tác</h1>
          <p className="text-sm text-muted-foreground">Quản lý và theo dõi tiến độ công tác</p>
        </div>
        {canManage && <CreateWorkDialog onCreated={(w) => setWorks((prev) => [w, ...prev])} />}
      </div>

      <div className="rounded-lg border w-full overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Loại công tác</TableHead>
              <TableHead className="hidden md:table-cell">Kế hoạch</TableHead>
              <TableHead className="hidden lg:table-cell">Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {works.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  Chưa có công tác nào.
                </TableCell>
              </TableRow>
            ) : works.map((work) => {
              const cls = STATUS_CLASSES[work.status] ?? "bg-muted text-muted-foreground"
              return (
                <TableRow key={work.id} className="cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => handleView(work)}>
                  <TableCell>
                    <div className="font-medium">{work.workTypeName}</div>
                    <div className="text-xs text-muted-foreground md:hidden">{work.planName}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{work.planName}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground whitespace-nowrap">
                    {work.startDate} → {work.endDate}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>
                      {work.statusName}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon className="size-4" />
                          <span className="sr-only">Thao tác</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
<<<<<<< HEAD
                        <DropdownMenuItem onClick={() => handleView(work)} className="flex items-center gap-2 font-semibold">
                          <ClipboardList className="size-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
=======
                        <DropdownMenuItem asChild>
                          <Link href={`/works/${work.id}`} className="flex items-center gap-2">
                            <EyeIcon className="size-4" />
                            Xem chi tiết
                          </Link>
                        </DropdownMenuItem>
>>>>>>> main
                        {canManage && (
                          <DropdownMenuItem asChild>
                            <Link href={`/works/${work.id}/assign`} className="flex items-center gap-2">
                              <UsersIcon className="size-4" />
                              Phân công
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link href={`/works/${work.id}/progress`} className="flex items-center gap-2">
                            <BarChart3Icon className="size-4" />
                            Cập nhật tiến độ
                          </Link>
                        </DropdownMenuItem>
<<<<<<< HEAD
=======
                        {canManage && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(work.id)} className="flex items-center gap-2">
                              <Trash2Icon className="size-4" />
                              Xóa
                            </DropdownMenuItem>
                          </>
                        )}
>>>>>>> main
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <WorkSheet 
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        work={selectedWork}
        onSuccess={refresh}
        canManage={canManage}
      />
    </div>
  )
}

import { ClipboardList } from "lucide-react"
