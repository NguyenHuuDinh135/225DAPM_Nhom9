import { Suspense } from "react"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, MapPinIcon, CalendarIcon, RulerIcon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

interface TreeDetail {
  id: number
  name: string | null
  condition: string | null
  treeTypeName: string | null
  height: number | null
  trunkDiameter: number | null
  recordedDate: string | null
  lastMaintenanceDate: string | null
  latitude: number | null
  longitude: number | null
}

async function fetchTree(id: string): Promise<TreeDetail | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const res = await fetch(`${BASE_URL}/api/trees/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: { revalidate: 0 },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("fetch failed")
  return res.json()
}

const conditionColor: Record<string, string> = {
  Good: "bg-green-100 text-green-700",
  Fair: "bg-yellow-100 text-yellow-700",
  Poor: "bg-red-100 text-red-700",
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value ?? "—"}</span>
    </div>
  )
}

async function TreeDetailContent({ id }: { id: string }) {
  const tree = await fetchTree(id)
  if (!tree) notFound()

  const cls = conditionColor[tree.condition ?? ""] ?? "bg-muted text-muted-foreground"

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin cơ bản</CardTitle></CardHeader>
        <CardContent className="divide-y">
          <Row label="Mã cây" value={`#${tree.id}`} />
          <Row label="Tên cây" value={tree.name} />
          <Row label="Loại cây" value={tree.treeTypeName} />
          <Row label="Tình trạng" value={
            <Badge className={cls}>{tree.condition ?? "—"}</Badge>
          } />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Thông số kỹ thuật</CardTitle></CardHeader>
        <CardContent className="divide-y">
          <Row label="Chiều cao (m)" value={tree.height} />
          <Row label="Đường kính thân (cm)" value={tree.trunkDiameter} />
          <Row label="Ngày ghi nhận" value={tree.recordedDate ? new Date(tree.recordedDate).toLocaleDateString("vi-VN") : null} />
          <Row label="Bảo dưỡng gần nhất" value={tree.lastMaintenanceDate ? new Date(tree.lastMaintenanceDate).toLocaleDateString("vi-VN") : null} />
        </CardContent>
      </Card>

      {(tree.latitude != null || tree.longitude != null) && (
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPinIcon className="size-4" />Tọa độ</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm font-mono">
              {tree.latitude?.toFixed(6)}, {tree.longitude?.toFixed(6)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TreeDetailSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[0, 1].map((i) => (
        <Card key={i}>
          <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((j) => <Skeleton key={j} className="h-4 w-full" />)}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function TreeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = params as unknown as { id: string }
  // Next.js 15: params is a Promise, but we use it in Server Component via Suspense
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-w-0">
      <div className="flex items-center gap-3">
        <Link href="/trees" className="inline-flex items-center justify-center size-9 rounded-md hover:bg-muted">
          <ArrowLeftIcon className="size-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">Chi tiết cây xanh</h1>
      </div>
      <Suspense fallback={<TreeDetailSkeleton />}>
        <TreeDetailContentWrapper params={params} />
      </Suspense>
    </div>
  )
}

async function TreeDetailContentWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TreeDetailContent id={id} />
}
