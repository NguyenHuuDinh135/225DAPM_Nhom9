"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@workspace/ui/components/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { UsersIcon, BarChart3Icon, MoreHorizontalIcon } from "lucide-react"
import { CreateWorkDialog } from "./create-work-dialog"
import type { WorkItem, WorkStatus } from "../page"

const statusConfig: Record<WorkStatus, { label: string; className: string }> = {
  New: { label: "Mới", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  InProgress: { label: "Đang thực hiện", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  WaitingForApproval: { label: "Chờ duyệt", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  Completed: { label: "Hoàn thành", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  Cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
}

export function WorksClient({ initialWorks }: { initialWorks: WorkItem[] }) {
  const [works, setWorks] = useState<WorkItem[]>(initialWorks)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-w-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Danh sách công việc</h1>
          <p className="text-sm text-muted-foreground">Quản lý và theo dõi tiến độ công việc</p>
        </div>
        <CreateWorkDialog onCreated={(w) => setWorks((prev) => [w, ...prev])} />
      </div>

      <div className="rounded-lg border w-full overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Loại công việc</TableHead>
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
                  Chưa có công việc nào.
                </TableCell>
              </TableRow>
            ) : works.map((work) => {
              const status = statusConfig[work.status] ?? { label: work.statusName, className: "bg-muted text-muted-foreground" }
              return (
                <TableRow key={work.id}>
                  <TableCell>
                    <div className="font-medium">{work.workTypeName}</div>
                    <div className="text-xs text-muted-foreground md:hidden">{work.planName}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {work.planName}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground whitespace-nowrap">
                    {work.startDate} → {work.endDate}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${status.className}`}>
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon className="size-4" />
                          <span className="sr-only">Thao tác</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/works/${work.id}/assign`} className="flex items-center gap-2">
                            <UsersIcon className="size-4" />
                            Phân công
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/works/${work.id}/progress`} className="flex items-center gap-2">
                            <BarChart3Icon className="size-4" />
                            Cập nhật tiến độ
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
