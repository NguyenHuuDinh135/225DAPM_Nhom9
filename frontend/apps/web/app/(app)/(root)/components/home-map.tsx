"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Map, MapControls, MapMarker, MapPopup, MarkerContent } from "@workspace/ui/components/ui/map"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

interface TreeMapDto { id: number; name: string | null; condition: string | null; treeTypeName: string | null; latitude: number | null; longitude: number | null }

function markerColor(condition: string | null) {
  if (!condition) return "bg-gray-400"
  const c = condition.toLowerCase()
  if (c.includes("tốt") || c === "good") return "bg-[#32CD32]"
  if (c.includes("bình thường") || c === "fair") return "bg-amber-400"
  return "animate-pulse bg-orange-500"
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-[#007B22] last:border-b-0">
      <div className="w-1/3 border-r border-[#007B22] p-2 font-medium text-foreground">{label}</div>
      <div className="w-2/3 p-2 text-foreground">{value}</div>
    </div>
  )
}

export function TreeManagementMap() {
  const [trees, setTrees] = React.useState<TreeMapDto[]>([])
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  React.useEffect(() => {
    fetch(`${BASE_URL}/api/trees/map`)
      .then((r) => r.ok ? r.json() : { trees: [] })
      .then((d: { trees: TreeMapDto[] }) => setTrees(d.trees.filter((t) => t.latitude != null && t.longitude != null)))
      .catch(() => {})
  }, [])

  const selected = selectedIndex !== null ? trees[selectedIndex] ?? null : null

  return (
    <div className="absolute inset-0 z-10 bg-muted/10">
      <Map center={[108.2149, 16.0644]} zoom={13.5} className="relative h-full w-full">
        <MapControls position="top-right" showCompass showLocate showZoom />
        {trees.map((tree, index) => (
          <MapMarker key={tree.id} longitude={tree.longitude!} latitude={tree.latitude!}>
            <MarkerContent>
              <div onClick={(e) => { e.stopPropagation(); setSelectedIndex(index) }} className="flex h-7 w-7 cursor-pointer items-center justify-center">
                <div className={`h-3 w-3 rounded-full border border-green-950 shadow-sm transition-transform hover:scale-[1.9] ${markerColor(tree.condition)}`} />
              </div>
            </MarkerContent>
          </MapMarker>
        ))}
        {selected && (
          <MapPopup
            longitude={selected.longitude!} latitude={selected.latitude!}
            onClose={() => setSelectedIndex(null)} closeButton={false} anchor="bottom" offset={15}
            className="z-50 w-[390px] overflow-hidden rounded-md border border-border bg-background p-0 shadow-2xl"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b p-3">
                <div>
                  <h3 className="text-[15px] font-bold text-[#007B22]">Thông tin cơ bản</h3>
                  <p className="text-xs text-muted-foreground">#{selected.id} • {selected.treeTypeName ?? "—"}</p>
                </div>
                <X className="h-4 w-4 cursor-pointer text-muted-foreground" onClick={() => setSelectedIndex(null)} />
              </div>
              <div className="p-3">
                <div className="overflow-hidden rounded-[2px] border border-[#007B22] text-[13px]">
                  <Row label="Tên cây" value={selected.name ?? "—"} />
                  <Row label="Loại cây" value={selected.treeTypeName ?? "—"} />
                  <Row label="Tình trạng" value={selected.condition ?? "—"} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 pb-3">
                <Button asChild className="h-7 rounded-sm bg-[#007B22] px-3 text-[12px] text-white shadow-none hover:bg-[#006400]">
                  <Link href={`/tree-detail/${selected.id}`}>Chi tiết</Link>
                </Button>
                <Button asChild variant="outline" className="h-7 rounded-sm border-[#007B22] px-3 text-[12px] text-[#007B22] hover:bg-[#007B22] hover:text-white">
                  <Link href={`/report-incident?treeId=${selected.id}`}>Báo sự cố</Link>
                </Button>
                <div className="flex-1" />
                <Button variant="outline" className="h-7 w-7 rounded-sm border-none bg-[#007B22] p-0 text-white hover:bg-[#006400]"
                  onClick={() => setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-7 w-7 rounded-sm border-none bg-[#007B22] p-0 text-white hover:bg-[#006400]"
                  onClick={() => setSelectedIndex((i) => (i !== null && i < trees.length - 1 ? i + 1 : i))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </MapPopup>
        )}
      </Map>
    </div>
  )
}
