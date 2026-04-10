"use client"

import { useState } from "react"
import Link from "next/link"
import { mockWorks, statusConfig, type Work } from "./mock-data"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { UsersIcon, BarChart3Icon, MoreHorizontalIcon } from "lucide-react"
import { CreateWorkDialog } from "./components/create-work-dialog"

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>(mockWorks)

  function handleCreated(work: Work) {
    setWorks((prev) => [work, ...prev])
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Danh sách công việc</h1>
          <p className="text-sm text-muted-foreground">Quản lý và theo dõi tiến độ công việc</p>
        </div>
        <CreateWorkDialog onCreated={handleCreated} />
      </div>

      {/* Table */}
      <div className="rounded-lg border w-full overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Loại công việc</TableHead>
              <TableHead className="hidden md:table-cell">Kế hoạch</TableHead>
              <TableHead className="hidden lg:table-cell">Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="hidden sm:table-cell">Nhân viên</TableHead>
              <TableHead className="hidden sm:table-cell">Tiến độ</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {works.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  Chưa có công việc nào. Nhấn "Tạo công việc" để bắt đầu.
                </TableCell>
              </TableRow>
            ) : works.map((work) => {
              const lastProgress = work.workProgresses.length > 0
                ? work.workProgresses[work.workProgresses.length - 1]
                : undefined
              const percentage = lastProgress?.percentage ?? 0
              const status = statusConfig[work.status]

              return (
                <TableRow key={work.id}>
                  <TableCell>
                    <div className="font-medium">{work.workTypeName}</div>
                    <div className="text-xs text-muted-foreground md:hidden">{work.planName}</div>
                    <div className="mt-1 sm:hidden flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-[#007B22]" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{percentage}%</span>
                    </div>
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
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs">{work.workUsers.length} người</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-[#007B22] transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">{percentage}%</span>
                    </div>
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
