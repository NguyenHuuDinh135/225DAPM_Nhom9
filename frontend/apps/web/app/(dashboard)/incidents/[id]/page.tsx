import { Suspense } from "react"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { IncidentFeedbackForm } from "../components/incident-feedback-form"
import { ApproveIncidentButton } from "../components/approve-incident-button"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

interface IncidentDetail {
  id: number; treeId: number; treeName: string | null; description: string | null
  status: string | null; reportedDate: string; reportedBy: string | null; images: string[]
}

async function fetchIncident(id: string): Promise<IncidentDetail | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const res = await fetch(`${BASE_URL}/api/tree-incidents/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: { revalidate: 0 },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("fetch failed")
  return res.json()
}

const statusColor: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  InProgress: "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
}

async function IncidentDetailContent({ id }: { id: string }) {
  const incident = await fetchIncident(id)
  if (!incident) notFound()
  const cls = statusColor[incident.status ?? ""] ?? "bg-muted text-muted-foreground"

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base">Sự cố #{incident.id}</CardTitle>
            <Badge className={cls}>{incident.status ?? "—"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Cây liên quan</span>
            <span className="font-medium">{incident.treeName ?? `#${incident.treeId}`}</span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Người báo cáo</span>
            <span className="font-medium">{incident.reportedBy ?? "—"}</span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Ngày báo cáo</span>
            <span className="font-medium">{new Date(incident.reportedDate).toLocaleDateString("vi-VN")}</span>
          </div>
          {incident.description && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Mô tả</span>
                <p className="leading-relaxed">{incident.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {incident.images.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Hình ảnh sự cố</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {incident.images.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noreferrer">
                  <img src={src} alt={`Ảnh ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border hover:opacity-90 transition-opacity" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <IncidentFeedbackForm incidentId={incident.id} />
    </div>
  )
}

function IncidentDetailSkeleton() {
  return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
      <CardContent className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
      </CardContent>
    </Card>
  )
}

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-w-0">
      <div className="flex items-center gap-3">
        <Link href="/incidents" className="inline-flex items-center justify-center size-9 rounded-md hover:bg-muted">
          <ArrowLeftIcon className="size-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">Chi tiết sự cố</h1>
        <div className="ml-auto">
          <ApproveIncidentButton incidentId={Number(id)} />
        </div>
      </div>
      <Suspense fallback={<IncidentDetailSkeleton />}>
        <IncidentDetailContent id={id} />
      </Suspense>
    </div>
  )
}
