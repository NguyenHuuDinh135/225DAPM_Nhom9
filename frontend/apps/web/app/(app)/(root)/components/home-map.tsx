"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, X, ImageIcon, CameraOff } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Map, MapControls, MapMarker, MapPopup, MarkerContent, type MapRef } from "@workspace/ui/components/ui/map"
import { apiClient, getImageUrl } from "@/lib/api-client"

interface TreeMapDto { 
  id: number; 
  name: string | null; 
  condition: string | null; 
  treeTypeName: string | null; 
  latitude: number | null; 
  longitude: number | null;
  mainImageUrl: string | null;
}

function markerColor(condition: string | null) {
  if (!condition) return "bg-gray-400"
  const c = condition.toLowerCase()
  if (c.includes("tốt") || c === "good") return "bg-[#32CD32]"
  if (c.includes("bình thường") || c === "fair") return "bg-amber-400"
  return "animate-pulse bg-orange-500"
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-slate-100 last:border-b-0">
      <div className="w-1/3 border-r border-slate-100 p-2 font-bold text-slate-500 text-[11px] uppercase tracking-wider">{label}</div>
      <div className="w-2/3 p-2 text-slate-700 font-medium text-[12px]">{value}</div>
    </div>
  )
}

export function TreeManagementMap() {
  const mapRef = React.useRef<MapRef>(null)
  const [trees, setTrees] = React.useState<TreeMapDto[]>([])
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  React.useEffect(() => {
    apiClient.get<{ trees: TreeMapDto[] }>("/api/trees/map")
      .then((d) => setTrees(d.trees.filter((t) => t.latitude != null && t.longitude != null)))
      .catch((e) => console.error("Failed to fetch trees for map", e))
  }, [])

  function navigateTo(index: number) {
    setSelectedIndex(index)
    const tree = trees[index]
    if (tree?.longitude != null && tree?.latitude != null) {
      mapRef.current?.flyTo({ center: [tree.longitude, tree.latitude], zoom: 16, duration: 800 })
    }
  }

  const selected = selectedIndex !== null ? trees[selectedIndex] ?? null : null

  return (
    <div className="absolute inset-0 z-10 bg-muted/10">
      <Map ref={mapRef} center={[108.2149, 16.0644]} zoom={13.5} className="relative h-full w-full">
        <MapControls position="top-right" showCompass showLocate showZoom />
        {trees.map((tree, index) => (
          <MapMarker key={tree.id} longitude={tree.longitude!} latitude={tree.latitude!}>
            <MarkerContent>
              <div onClick={(e) => { e.stopPropagation(); navigateTo(index) }} className="flex h-7 w-7 cursor-pointer items-center justify-center">
                <div className={`h-3 w-3 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-[1.9] ${markerColor(tree.condition)}`} />
              </div>
            </MarkerContent>
          </MapMarker>
        ))}
        {selected && (
          <MapPopup
            longitude={selected.longitude!} latitude={selected.latitude!}
            onClose={() => setSelectedIndex(null)} closeButton={false} anchor="bottom" offset={15}
            className="z-50 w-[350px] overflow-hidden rounded-2xl border border-white/20 bg-white/95 backdrop-blur-md p-0 shadow-2xl"
          >
            <div className="flex flex-col">
              {/* Image Section */}
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                {selected.mainImageUrl ? (
                  <img 
                    src={getImageUrl(selected.mainImageUrl)} 
                    className="h-full w-full object-cover" 
                    alt={selected.name || "Cây"} 
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                    <CameraOff className="size-8" />
                    <span className="text-[10px] font-bold mt-1 uppercase">Không có ảnh</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <button onClick={() => setSelectedIndex(null)} className="p-1.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors">
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-base font-black text-green-900 leading-tight">{selected.name || `Cây #${selected.id}`}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">#{selected.id} • {selected.treeTypeName ?? "Chưa rõ loài"}</p>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 mb-4">
                  <Row label="Loại cây" value={selected.treeTypeName ?? "—"} />
                  <Row label="Tình trạng" value={selected.condition ?? "—"} />
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild className="flex-1 h-10 rounded-xl bg-green-600 px-3 text-[12px] font-bold text-white shadow-lg shadow-green-600/20 hover:bg-green-700">
                    <Link href={`/tree-detail/${selected.id}`}>Xem chi tiết</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 h-10 rounded-xl border-orange-200 bg-orange-50 px-3 text-[12px] font-bold text-orange-700 hover:bg-orange-100 hover:text-orange-800 border-dashed">
                    <Link href={`/report-incident?treeId=${selected.id}`}>Báo sự cố</Link>
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-100">
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0"
                    disabled={selectedIndex === 0}
                    onClick={() => selectedIndex !== null && navigateTo(selectedIndex - 1)}>
                    <ChevronLeft className="h-5 w-5 text-slate-400" />
                  </Button>
                  <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">Duyệt danh sách</span>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0"
                    disabled={selectedIndex === trees.length - 1}
                    onClick={() => selectedIndex !== null && navigateTo(selectedIndex + 1)}>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </Button>
                </div>
              </div>
            </div>
          </MapPopup>
        )}
      </Map>
    </div>
  )
}
