import { type Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@workspace/ui/components/table"
import type { WorkItem } from "../works/page"

export const metadata: Metadata = { title: "Thay thế cây" }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

const STATUS_LABEL: Record<string, string> = {
  New: "Mới", InProgress: "Đang thực hiện", WaitingForApproval: "Chờ duyệt",
  Completed: "Hoàn thành", Cancelled: "Đã hủy",
}
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  New: "outline", InProgress: "secondary", WaitingForApproval: "secondary",
  Completed: "default", Cancelled: "destructive",
}

async function fetchReplacements(): Promise<WorkItem[]> {
  const token = (await cookies()).get("access_token")?.value
  const res = await fetch(`${BASE_URL}/api/work-items`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  })
  if (!res.ok) return []
  const json = await res.json() as { workItems: WorkItem[] }
  const all = json.workItems ?? []
  return all.filter((w) =>
    w.workTypeName?.toLowerCase().includes("thay") ||
    w.workTypeName?.toLowerCase().includes("reloc") ||
    w.workTypeName?.toLowerCase().includes("replace")
  )
}

export default async function ReplacementsPage() {
  const items = await fetchReplacements()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Thay thế cây</h1>
        <p className="text-sm text-muted-foreground">Danh sách công việc thay thế / di dời cây xanh</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Loại công việc</TableHead>
              <TableHead>Kế hoạch</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Không có công việc thay thế cây nào.
                </TableCell>
              </TableRow>
            ) : items.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-mono">#{w.id}</TableCell>
                <TableCell className="font-medium">{w.workTypeName ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{w.planName ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {w.startDate ? new Date(w.startDate).toLocaleDateString("vi-VN") : "—"}
                  {" → "}
                  {w.endDate ? new Date(w.endDate).toLocaleDateString("vi-VN") : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[w.status] ?? "outline"}>
                    {STATUS_LABEL[w.status] ?? w.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/works/${w.id}`} className="text-xs text-primary hover:underline">
                    Chi tiết
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
