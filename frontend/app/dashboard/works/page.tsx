import Link from "next/link"
import { mockWorks, statusConfig } from "./mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconUsers, IconChartBar, IconPlus } from "@tabler/icons-react"

export default function WorksPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Danh sách công việc</h1>
          <p className="text-sm text-muted-foreground">Quản lý và theo dõi tiến độ công việc</p>
        </div>
        <Button size="sm" className="w-fit">
          <IconPlus className="size-4" />
          Tạo công việc
        </Button>
      </div>

      {/* Table — scrollable on small screens */}
      <div className="rounded-lg border overflow-auto">
        <Table className="min-w-[640px]">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[140px]">Loại công việc</TableHead>
              <TableHead className="w-[160px]">Kế hoạch</TableHead>
              <TableHead className="w-[200px]">Thời gian</TableHead>
              <TableHead className="w-[130px]">Trạng thái</TableHead>
              <TableHead className="w-[90px]">Nhân viên</TableHead>
              <TableHead className="w-[140px]">Tiến độ</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockWorks.map((work) => {
              const latestProgress = work.workProgresses.at(-1)
              const percentage = latestProgress?.percentage ?? 0
              const status = statusConfig[work.status]

              return (
                <TableRow key={work.id}>
                  <TableCell className="font-medium">{work.workTypeName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{work.planName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {work.startDate} → {work.endDate}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{work.workUsers.length} người</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">{percentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" asChild>
                        <Link href={`/dashboard/works/${work.id}/assign`}>
                          <IconUsers className="size-3" />
                          <span className="hidden sm:inline">Phân công</span>
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" asChild>
                        <Link href={`/dashboard/works/${work.id}/progress`}>
                          <IconChartBar className="size-3" />
                          <span className="hidden sm:inline">Tiến độ</span>
                        </Link>
                      </Button>
                    </div>
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
