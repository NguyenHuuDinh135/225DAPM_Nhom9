"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, List, MoreHorizontal, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Map,
  MapControls,
  MapMarker,
  MapPopup,
  MarkerContent,
} from "@workspace/ui/components/ui/map"

import { getStatusLabel, getTreeById, treeRecords } from "@/lib/trees"

const trees = treeRecords
  .map((tree) => getTreeById(tree.id))
  .filter((tree) => tree !== null)

export function TreeManagementMap() {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  const selectedTree =
    selectedIndex !== null && trees[selectedIndex] ? trees[selectedIndex] : null

  const moveSelection = (direction: -1 | 1) => {
    if (selectedIndex === null) {
      return
    }

    const nextIndex = selectedIndex + direction

    if (nextIndex < 0 || nextIndex >= trees.length) {
      return
    }

    setSelectedIndex(nextIndex)
  }

  return (
    <div className="absolute inset-0 z-10 bg-muted/10">
      <Map center={[108.2149, 16.0644]} zoom={13.5} className="relative h-full w-full">
        <MapControls position="top-right" showCompass showLocate showZoom />

        {trees.map((tree, index) => (
          <MapMarker
            key={tree.id}
            longitude={tree.lng}
            latitude={tree.lat}
          >
            <MarkerContent>
              <div
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedIndex(index)
                }}
                className="flex h-7 w-7 cursor-pointer items-center justify-center"
              >
                <div
                  className={`h-3 w-3 rounded-full border border-green-950 shadow-sm transition-transform hover:scale-[1.9] ${
                    tree.status === "healthy"
                      ? "bg-[#32CD32]"
                      : tree.status === "monitoring"
                        ? "bg-amber-400"
                        : "animate-pulse bg-orange-500"
                  }`}
                />
              </div>
            </MarkerContent>
          </MapMarker>
        ))}

        {selectedTree && (
          <MapPopup
            longitude={selectedTree.lng}
            latitude={selectedTree.lat}
            onClose={() => setSelectedIndex(null)}
            closeButton={false}
            anchor="bottom"
            offset={15}
            className="z-50 w-[390px] overflow-hidden rounded-md border border-border bg-background p-0 shadow-2xl"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b p-3">
                <div>
                  <h3 className="text-[15px] font-bold text-[#007B22]">
                    Thông tin cơ bản
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedTree.code} • {selectedTree.species.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ChevronLeft
                    className={`h-4 w-4 cursor-pointer ${
                      selectedIndex === 0
                        ? "pointer-events-none text-muted-foreground/40"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => moveSelection(-1)}
                  />
                  <X
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedIndex(null)}
                  />
                </div>
              </div>

              <div className="p-3">
                <div className="overflow-hidden rounded-[2px] border border-[#007B22] text-[13px]">
                  <Row label="Tên cây" value={selectedTree.species.name} />
                  <Row label="Địa chỉ" value={selectedTree.addressLine} />
                  <Row label="Tuyến đường" value={selectedTree.street} />
                  <Row label="Tình trạng" value={getStatusLabel(selectedTree.status)} />
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 pb-3">
                <Button
                  asChild
                  className="h-7 rounded-sm bg-[#007B22] px-3 text-[12px] text-white shadow-none hover:bg-[#006400]"
                >
                  <Link href={`/tree-detail/${selectedTree.id}?from=home`}>Chi tiết</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-7 rounded-sm border-[#007B22] px-3 text-[12px] text-[#007B22] hover:bg-[#007B22] hover:text-white"
                >
                  <Link href="/category">Danh mục</Link>
                </Button>
                <Button className="h-7 w-8 rounded-sm bg-[#007B22] p-0 text-white shadow-none hover:bg-[#006400]">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                <div className="flex-1" />
                <Button
                  variant="outline"
                  className="h-7 w-7 rounded-sm border-none bg-[#007B22] p-0 text-white hover:bg-[#006400] hover:text-white"
                  onClick={() => moveSelection(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-7 w-7 rounded-sm border-none bg-[#007B22] p-0 text-white hover:bg-[#006400] hover:text-white"
                  onClick={() => moveSelection(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="ml-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <List className="h-3 w-3" />
                  {(selectedIndex ?? 0) + 1} trên {trees.length}
                </span>
              </div>
            </div>
          </MapPopup>
        )}
      </Map>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-[#007B22] last:border-b-0">
      <div className="w-1/3 border-r border-[#007B22] p-2 font-medium text-foreground">
        {label}
      </div>
      <div className="w-2/3 p-2 text-foreground">{value}</div>
    </div>
  )
}
