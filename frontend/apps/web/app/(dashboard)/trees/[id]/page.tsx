"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  TreePine, MapPin, Calendar, Ruler, 
  ArrowLeft, AlertTriangle, History, 
  Wrench, Edit2, Loader2, Camera
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { apiClient, getImageUrl } from "@/lib/api-client"
import { Map, MapMarker, MarkerContent, MapControls } from "@workspace/ui/components/ui/map"
import { toast } from "@workspace/ui/components/sonner"

interface TreeDetail {
  id: number;
  name: string | null;
  condition: string | null;
  treeTypeName: string | null;
  height: number | null;
  trunkDiameter: number | null;
  latitude: number | null;
  longitude: number | null;
  mainImageUrl: string | null;
  recordedDate: string | null;
  lastMaintenanceDate: string | null;
}

export default function TreeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [tree, setTree] = React.useState<TreeDetail | null>(null)
  const [loading, setLoading] = React.useState(true)

  const loadDetail = async () => {
    try {
      const data = await apiClient.get<TreeDetail>(`/api/trees/${id}`)
      setTree(data)
    } catch (err) {
      toast.error("Lỗi", { description: "Không thể tải thông tin chi tiết cây xanh." })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadDetail()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-green-600" />
      </div>
    )
  }

  if (!tree) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold">Không tìm thấy cây xanh</h2>
        <Button onClick={() => router.back()} variant="ghost" className="mt-4">
          <ArrowLeft className="mr-2 size-4" /> Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Chi tiết Cây xanh #{tree.id}</h1>
          <p className="text-sm text-slate-500 font-medium italic">{tree.name || "Cây chưa đặt tên"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image & Basic Info */}
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[2rem] border-none shadow-xl">
            <div className="aspect-square relative group">
              {tree.mainImageUrl ? (
                <img 
                  src={getImageUrl(tree.mainImageUrl)} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
                  alt={tree.name || "Tree"} 
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
                  <Camera className="size-16 mb-2" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Chưa có hình ảnh</span>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Badge className={cn(
                  "px-3 py-1 rounded-full font-black uppercase tracking-widest border-none shadow-lg",
                  tree.condition === "Tốt" ? "bg-green-600 text-white" : "bg-amber-500 text-white"
                )}>
                  {tree.condition?.toUpperCase() || "Bình thường"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-black text-slate-800 mb-1">{tree.treeTypeName}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">Loài cây đô thị</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Chiều cao</p>
                  <p className="font-bold text-slate-700">{tree.height ? `${tree.height} m` : "—"}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Đường kính</p>
                  <p className="font-bold text-slate-700">{tree.trunkDiameter ? `${tree.trunkDiameter} cm` : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <History className="size-4 text-green-600" /> Lịch sử & Bảo trì
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">Ngày ghi nhận:</span>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {tree.recordedDate ? new Date(tree.recordedDate).toLocaleDateString("vi-VN") : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="size-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">Bảo trì cuối:</span>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {tree.lastMaintenanceDate ? new Date(tree.lastMaintenanceDate).toLocaleDateString("vi-VN") : "Chưa bảo trì"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Map & Location Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full flex flex-col rounded-[2rem] border-none shadow-xl overflow-hidden">
            <CardHeader className="bg-white z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="size-4 text-red-500" /> Vị trí trên bản đồ
                </CardTitle>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded-lg text-slate-600 font-bold">
                    {tree.latitude?.toFixed(6)}, {tree.longitude?.toFixed(6)}
                   </span>
                </div>
              </div>
            </CardHeader>
            <div className="flex-1 min-h-[400px] relative">
              {tree.latitude && tree.longitude && (
                <Map
                  center={[tree.longitude, tree.latitude]}
                  zoom={17}
                >
                  <MapControls showLocate showZoom />
                  <MapMarker longitude={tree.longitude} latitude={tree.latitude}>
                    <MarkerContent>
                      <div className="size-10 bg-green-600 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white animate-bounce-slow">
                        <TreePine className="size-6" />
                      </div>
                    </MarkerContent>
                  </MapMarker>
                </Map>
              )}
            </div>
            <CardContent className="p-6 bg-slate-50">
               <div className="flex items-start gap-4">
                 <div className="size-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                    <AlertTriangle className="size-5" />
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-slate-800">Thông báo hiện trạng</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">
                     Vị trí cây xanh được xác định qua tọa độ GPS thực tế. Cây xanh này đang trong trạng thái <strong>{tree.condition}</strong>. 
                     Mọi sự thay đổi về vị trí hoặc hiện trạng cần được cập nhật ngay bởi Đội trưởng phụ trách khu vực.
                   </p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
