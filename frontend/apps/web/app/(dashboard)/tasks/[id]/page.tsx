import { Suspense } from "react"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

interface WorkProgress {
  id: number
  updaterId: string
  note: string | null
  updatedDate: string | null
  images: string[]
}

interface WorkUser {
  userId: string
  role: string | null
  status: string | null
}

interface WorkDetail {
  id: number
  workTypeName: string | null
  planName: string | null
  creatorId: string
  startDate: string | null
  endDate: string | null
  status: number
  rejectionFeedback: string | null
  progresses: WorkProgress[]
  users: WorkUser[]
}

async function fetchWork(id: string): Promise<WorkDetail | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const res = await fetch(`${BASE_URL}/api/work-items/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: { revalidate: 0 },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("fetch failed")
  return res.json()
}

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Mới", className: "bg-blue-100 text-blue-700" },
  1: { label: "Đang thực hiện", className: "bg-yellow-100 text-yellow-700" },
  2: { label: "Chờ duyệt", className: "bg-purple-100 text-purple-700" },
  3: { label: "Hoàn thành", className: "bg-green-100 text-green-700" },
  4: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value ?? "—"}</span>
    </div>
  )
}

async function WorkDetailContent({ id }: { id: string }) {
  const work = await fetchWork(id)
  if (!work) notFound()

  const statusInfo = STATUS_MAP[work.status] ?? { label: String(work.status), className: "bg-muted text-muted-foreground" }

  return (
    <div className="flex flex-col gap-4">
      {/* Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base">{work.workTypeName ?? `Công việc #${work.id}`}</CardTitle>
            <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="divide-y">
          <Row label="Kế hoạch" value={work.planName} />
          <Row label="Người tạo" value={<span className="font-mono text-xs">{work.creatorId}</span>} />
          <Row label="Ngày bắt đầu" value={work.startDate ? new Date(work.startDate).toLocaleDateString("vi-VN") : null} />
          <Row label="Ngày kết thúc" value={work.endDate ? new Date(work.endDate).toLocaleDateString("vi-VN") : null} />
          {work.rejectionFeedback && (
            <Row label="Lý do từ chối" value={<span className="text-destructive">{work.rejectionFeedback}</span>} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Users */}
        <Card>
          <CardHeader><CardTitle className="text-base">Nhân viên phân công ({work.users.length})</CardTitle></CardHeader>
          <CardContent>
            {work.users.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có nhân viên nào.</p>
            ) : (
              <div className="flex flex-col divide-y">
                {work.users.map((u) => (
                  <div key={u.userId} className="flex items-center justify-between py-2 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">{u.userId}</span>
                    <div className="flex items-center gap-2">
                      {u.role && <Badge variant="outline" className="text-xs">{u.role}</Badge>}
                      {u.status && <span className="text-xs text-green-600">{u.status}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader><CardTitle className="text-base">Lịch sử tiến độ ({work.progresses.length})</CardTitle></CardHeader>
          <CardContent>
            {work.progresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có cập nhật nào.</p>
            ) : (
              <div className="flex flex-col">
                {[...work.progresses].reverse().map((p, i, arr) => (
                  <div key={p.id} className="flex gap-3">
                    <div className="flex flex-col items-center pt-1 shrink-0">
                      <div className="size-2 rounded-full bg-[#007B22]" />
                      {i < arr.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                    </div>
                    <div className="pb-3 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                        <span className="font-mono">{p.updaterId}</span>
                        {p.updatedDate && <span>· {new Date(p.updatedDate).toLocaleDateString("vi-VN")}</span>}
                      </div>
                      {p.note && <p className="text-sm mt-0.5 break-words">{p.note}</p>}
                      {p.images.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.images.map((src, idx) => (
                            <a key={idx} href={src} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Ảnh {idx + 1}</a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function WorkDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[0, 1, 2].map((j) => <Skeleton key={j} className="h-4 w-full" />)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

async function WorkDetailContentWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <WorkDetailContent id={id} />
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-w-0">
      <div className="flex items-center gap-3">
        <Link href="/tasks" className="inline-flex items-center justify-center size-9 rounded-md hover:bg-muted">
          <ArrowLeftIcon className="size-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">Chi tiết công việc</h1>
      </div>
      <Suspense fallback={<WorkDetailSkeleton />}>
        <WorkDetailContentWrapper params={params} />
      </Suspense>
    </div>
  )
}
