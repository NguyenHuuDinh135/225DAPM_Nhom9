import { Suspense } from "react"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, MapPinIcon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { RelocateTreeForm } from "./relocate-form"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

interface TreeDetail {
  id: number; name: string | null; condition: string | null; treeTypeName: string | null
  height: number | null; trunkDiameter: number | null; recordedDate: string | null
  lastMaintenanceDate: string | null; latitude: number | null; longitude: number | null
  relocationCount: number
}

interface LocationHistory {
  locationId: number; streetName: string | null; houseNumber: number | null
  fromDate: string; toDate: string | null
}

async function fetchTree(id: string) {
  const token = (await cookies()).get("access_token")?.value
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined
  const [treeRes, histRes] = await Promise.all([
    fetch(`${BASE_URL}/api/trees/${id}`, { headers, cache: "no-store" }),
    fetch(`${BASE_URL}/api/trees/${id}/location-history`, { headers, cache: "no-store" }),
  ])
  if (!treeRes.ok) return null
  const tree: TreeDetail = await treeRes.json()
  const history: LocationHistory[] = histRes.ok ? await histRes.json() : []
  return { tree, history }
}

const conditionColor: Record<string, string> = {
  Good: "bg-green-100 text-green-700", Fair: "bg-yellow-100 text-yellow-700", Poor: "bg-red-100 text-red-700",
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
  const data = await fetchTree(id)
  if (!data) notFound()
  const { tree, history } = data
  const cls = conditionColor[tree.condition ?? ""] ?? "bg-muted text-muted-foreground"

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin cơ bản</CardTitle></CardHeader>
        <CardContent className="divide-y">
          <Row label="Mã cây" value={`#${tree.id}`} />
          <Row label="Tên cây" value={tree.name} />
          <Row label="Loại cây" value={tree.treeTypeName} />
          <Row label="Tình trạng" value={<Badge className={cls}>{tree.condition ?? "—"}</Badge>} />
          <Row label="Số lần di dời" value={tree.relocationCount ?? 0} />
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
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPinIcon className="size-4" />Tọa độ hiện tại</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm font-mono">{tree.latitude?.toFixed(6)}, {tree.longitude?.toFixed(6)}</p>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Lịch sử vị trí</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative border-l border-border ml-2 flex flex-col gap-4">
              {history.map((h) => (
                <li key={h.locationId} className="ml-4">
                  <div className="absolute -left-1.5 mt-1.5 size-3 rounded-full border border-background bg-primary" />
                  <p className="text-sm font-medium">{h.streetName ?? "—"}{h.houseNumber ? ` số ${h.houseNumber}` : ""}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.fromDate).toLocaleDateString("vi-VN")}
                    {" → "}
                    {h.toDate ? new Date(h.toDate).toLocaleDateString("vi-VN") : "Hiện tại"}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <RelocateTreeForm treeId={tree.id} />
    </div>
  )
}

export default function TreeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Link href="/trees" className="inline-flex items-center justify-center size-9 rounded-md hover:bg-muted">
          <ArrowLeftIcon className="size-4" />
        </Link>
        <h1 className="text-xl font-semibold md:text-2xl">Chi tiết cây xanh</h1>
      </div>
      <Suspense fallback={<div className="grid gap-4 md:grid-cols-2">{[0,1].map(i=><Card key={i}><CardContent className="p-6"><Skeleton className="h-40 w-full"/></CardContent></Card>)}</div>}>
        <TreeDetailContentWrapper params={params} />
      </Suspense>
    </div>
  )
}

async function TreeDetailContentWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TreeDetailContent id={id} />
}
