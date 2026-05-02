import { type Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { WorkflowBanner } from "../components/workflow-banner"
import { Role } from "@/lib/roles"

export const metadata: Metadata = { title: "Chi tiết kế hoạch" }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

interface PlanWorkItem { id: number; workTypeName: string | null; startDate: string | null; endDate: string | null; status: string }
interface PlanDetail {
  id: number; name: string | null; status: string | null; statusName: string | null
  rejectionReason: string | null;
  startDate: string | null; endDate: string | null
  creatorId: string; approverId: string | null
  works: PlanWorkItem[]
}

const STATUS_LABEL: Record<string, string> = {
  New: "Mới", InProgress: "Đang thực hiện", WaitingForApproval: "Chờ duyệt",
  Completed: "Hoàn thành", Cancelled: "Đã hủy",
}

async function fetchPlan(id: string): Promise<PlanDetail | null> {
  const token = (await cookies()).get("access_token")?.value
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(`${BASE_URL}/api/planning/${id}`, {
    headers,
    cache: "no-store",
  })
  if (!res.ok) return null
  return res.json()
}

async function getMe(): Promise<{ role: Role } | null> {
  const token = (await cookies()).get("access_token")?.value
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(`${BASE_URL}/api/users/me`, {
    headers,
  })
  if (!res.ok) return null
  return res.json()
}

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [plan, me] = await Promise.all([fetchPlan(id), getMe()])
  
  if (!plan) notFound()
  const userRole = me?.role || "NhanVien"

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Link href="/plans" className="text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">{plan.name ?? `Kế hoạch #${plan.id}`}</h1>
          <p className="text-sm text-muted-foreground">
            {plan.startDate ? new Date(plan.startDate).toLocaleDateString("vi-VN") : "—"}
            {" → "}
            {plan.endDate ? new Date(plan.endDate).toLocaleDateString("vi-VN") : "—"}
          </p>
        </div>
      </div>

      <WorkflowBanner 
        planId={plan.id}
        status={plan.status ?? "Draft"}
        statusName={plan.statusName ?? "Nháp"}
        rejectionReason={plan.rejectionReason}
        userRole={userRole as Role}
      />

      <Card>
        <CardHeader><CardTitle className="text-base">Danh sách công tác ({plan.works.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Loại công tác</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.works.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Chưa có công tác nào.</TableCell></TableRow>
              ) : plan.works.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-mono">#{w.id}</TableCell>
                  <TableCell>{w.workTypeName ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {w.startDate ? new Date(w.startDate).toLocaleDateString("vi-VN") : "—"}
                    {" → "}
                    {w.endDate ? new Date(w.endDate).toLocaleDateString("vi-VN") : "—"}
                  </TableCell>
                  <TableCell><Badge variant="outline">{STATUS_LABEL[w.status] ?? w.status}</Badge></TableCell>
                  <TableCell>
                    <Link href={`/works/${w.id}`} className="text-xs text-primary hover:underline">Chi tiết</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
