import { type Metadata } from "next"
import { cookies } from "next/headers"
import { SectionCards, type DashboardStats } from "@/app/(dashboard)/components/section-cards"
import { ExportStatsButton } from "@/app/(dashboard)/components/export-stats-button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"

export const metadata: Metadata = { title: "Báo cáo" }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

interface OverdueWork {
  id: number
  workTypeName: string
  endDate: string | null
  status: string
}

interface StatsResponse extends DashboardStats {
  overdueWorks: OverdueWork[]
}

async function fetchStats(): Promise<StatsResponse> {
  const token = (await cookies()).get("access_token")?.value
  const res = await fetch(`${BASE_URL}/api/reports/dashboard-stats`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  })
  if (!res.ok) return { totalTrees: 0, pendingIncidents: 0, completedWorksThisMonth: 0, pendingWorksThisMonth: 0, overdueWorks: [] }
  return res.json()
}

const STATUS_LABEL: Record<string, string> = {
  New: "Mới", InProgress: "Đang thực hiện", WaitingForApproval: "Chờ duyệt",
  Completed: "Hoàn thành", Cancelled: "Đã hủy",
}

export default async function ReportsPage() {
  const stats = await fetchStats()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Báo cáo</h1>
          <p className="text-sm text-muted-foreground">Thống kê tổng quan hệ thống cây xanh</p>
        </div>
        <ExportStatsButton />
      </div>

      <SectionCards stats={stats} />

      <div className="rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="font-medium">Công việc quá hạn ({stats.overdueWorks.length})</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Loại công việc</TableHead>
              <TableHead>Hạn chót</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.overdueWorks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Không có công việc quá hạn.
                </TableCell>
              </TableRow>
            ) : stats.overdueWorks.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-mono">#{w.id}</TableCell>
                <TableCell>{w.workTypeName}</TableCell>
                <TableCell className="text-destructive">
                  {w.endDate ? new Date(w.endDate).toLocaleDateString("vi-VN") : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{STATUS_LABEL[w.status] ?? w.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
