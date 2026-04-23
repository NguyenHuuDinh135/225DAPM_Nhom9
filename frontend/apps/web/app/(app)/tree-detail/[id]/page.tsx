import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, MapPinIcon } from "lucide-react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

interface TreeDetail {
  id: number; name: string | null; condition: string | null; treeTypeName: string | null
  height: number | null; trunkDiameter: number | null; recordedDate: string | null
  lastMaintenanceDate: string | null; latitude: number | null; longitude: number | null
}

async function fetchTree(id: string): Promise<TreeDetail | null> {
  const res = await fetch(`${BASE_URL}/api/trees/${id}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex border-b border-[#007B22] last:border-b-0">
      <div className="w-2/5 border-r border-[#007B22] p-2.5 text-sm font-medium">{label}</div>
      <div className="w-3/5 p-2.5 text-sm">{value ?? "—"}</div>
    </div>
  )
}

export default async function TreeDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { id } = await params
  const { from } = await searchParams
  const tree = await fetchTree(id)
  if (!tree) notFound()

  const backHref = from === "category" ? "/category" : "/"
  const backLabel = from === "category" ? "Quay lại danh mục" : "Quay lại bản đồ"

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link href={backHref} className="text-[#007B22] hover:opacity-80">
          <ArrowLeftIcon className="size-5" />
        </Link>
        <h1 className="font-semibold text-[#007B22]">{tree.name ?? `Cây #${tree.id}`}</h1>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg flex flex-col gap-4">
        <div className="overflow-hidden rounded-lg border border-[#007B22] bg-white shadow-sm">
          <div className="bg-[#007B22] px-4 py-2">
            <h2 className="text-sm font-semibold text-white">Thông tin cơ bản</h2>
          </div>
          <div className="text-[13px]">
            <Row label="Mã cây" value={`#${tree.id}`} />
            <Row label="Tên cây" value={tree.name} />
            <Row label="Loại cây" value={tree.treeTypeName} />
            <Row label="Tình trạng" value={tree.condition} />
            <Row label="Chiều cao (m)" value={tree.height} />
            <Row label="Đường kính thân (cm)" value={tree.trunkDiameter} />
            <Row label="Ngày ghi nhận" value={tree.recordedDate ? new Date(tree.recordedDate).toLocaleDateString("vi-VN") : null} />
            <Row label="Bảo dưỡng gần nhất" value={tree.lastMaintenanceDate ? new Date(tree.lastMaintenanceDate).toLocaleDateString("vi-VN") : null} />
            {tree.latitude != null && (
              <Row label="Tọa độ" value={<span className="font-mono text-xs">{tree.latitude?.toFixed(5)}, {tree.longitude?.toFixed(5)}</span>} />
            )}
          </div>
        </div>

        <Link
          href={`/report-incident?treeId=${tree.id}`}
          className="flex items-center justify-center gap-2 rounded-lg border border-orange-400 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors"
        >
          Báo cáo sự cố cho cây này
        </Link>
      </div>
    </div>
  )
}
