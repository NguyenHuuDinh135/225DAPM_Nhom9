import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, MapPinIcon, CameraOffIcon, AlertTriangleIcon } from "lucide-react"
import { getImageUrl } from "@/lib/api-client"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

interface TreeDetail {
  id: number; 
  name: string | null; 
  condition: string | null; 
  treeTypeName: string | null;
  height: number | null; 
  trunkDiameter: number | null; 
  recordedDate: string | null;
  lastMaintenanceDate: string | null; 
  latitude: number | null; 
  longitude: number | null;
  mainImageUrl: string | null;
}

async function fetchTree(id: string): Promise<TreeDetail | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/trees/${id}`, { cache: "no-store" })
    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.error("Fetch tree error:", error)
    return null
  }
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex border-b border-slate-100 last:border-b-0">
      <div className="w-2/5 p-3 text-sm font-semibold text-slate-500 bg-slate-50/50">{label}</div>
      <div className="w-3/5 p-3 text-sm font-medium text-slate-900">{value ?? "—"}</div>
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
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeftIcon className="size-5 text-slate-600" />
          </Link>
          <h1 className="font-bold text-slate-800 truncate max-w-[200px]">
            {tree.name ?? `Cây #${tree.id}`}
          </h1>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          tree.condition?.includes("Tốt") ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
        }`}>
          {tree.condition ?? "Bình thường"}
        </div>
      </div>

      <div className="container mx-auto px-4 pt-4 max-w-lg flex flex-col gap-5">
        {/* Hình ảnh cây */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
          {tree.mainImageUrl ? (
            <img 
              src={getImageUrl(tree.mainImageUrl)} 
              alt={tree.name || "Cây xanh"} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400">
              <CameraOffIcon className="size-10" />
              <span className="text-xs font-medium">Chưa có hình ảnh</span>
            </div>
          )}
        </div>

        {/* Thông tin chi tiết */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b bg-slate-50/80 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Thông số kỹ thuật</h2>
          </div>
          <div className="flex flex-col">
            <Row label="Mã định danh" value={<span className="font-bold text-green-700">#{tree.id}</span>} />
            <Row label="Tên gọi" value={tree.name} />
            <Row label="Phân loại" value={tree.treeTypeName} />
            <Row label="Chiều cao" value={tree.height ? `${tree.height} m` : null} />
            <Row label="Đường kính thân" value={tree.trunkDiameter ? `${tree.trunkDiameter} cm` : null} />
            <Row label="Ngày ghi nhận" value={tree.recordedDate ? new Date(tree.recordedDate).toLocaleDateString("vi-VN") : null} />
            <Row label="Vị trí (Lat, Long)" value={tree.latitude ? (
              <div className="flex items-center gap-1">
                <MapPinIcon className="size-3 text-red-500" />
                <span className="text-xs font-mono">{tree.latitude.toFixed(6)}, {tree.longitude?.toFixed(6)}</span>
              </div>
            ) : null} />
          </div>
        </div>

        {/* Nút hành động */}
        <div className="grid grid-cols-1 gap-3">
          <Link
            href={`/report-incident?treeId=${tree.id}`}
            className="flex items-center justify-center gap-2.5 rounded-xl bg-orange-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700 active:scale-[0.98] transition-all"
          >
            <AlertTriangleIcon className="size-4" />
            BÁO CÁO SỰ CỐ KHẨN CẤP
          </Link>
          
          <p className="text-center text-[10px] text-slate-400 px-4 leading-relaxed">
            Việc báo cáo sự cố giúp thành phố Đà Nẵng kịp thời xử lý các tình huống nguy hiểm như cây đổ, cành gãy, sâu bệnh nặng.
          </p>
        </div>
      </div>
    </div>
  )
}
