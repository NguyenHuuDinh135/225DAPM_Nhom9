"use client"

import { SearchIcon, FilterIcon, FileDownIcon, ChevronDownIcon, PlusIcon, TreePineIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

interface TreeToolbarHeaderProps {
  selectedCount: number
  isExporting: boolean
  isAdmin: boolean
  conditionFilter: string
  search: string
  onExportAll: () => void
  onExportSelected: () => void
  onAdd: () => void
}

export function TreeToolbarHeader({
  selectedCount,
  isExporting,
  isAdmin,
  conditionFilter,
  search,
  onExportAll,
  onExportSelected,
  onAdd,
}: TreeToolbarHeaderProps) {
  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isExporting}
            variant="outline"
            className={cn(
              "h-11 px-6 rounded-2xl font-bold gap-2 border-blue-600 text-blue-600 hover:bg-blue-50",
              (conditionFilter || search || selectedCount > 0) && "bg-blue-50"
            )}
          >
            <FileDownIcon className="size-5" />
            {isExporting ? "ĐANG XUẤT..." : "XUẤT EXCEL"}
            {selectedCount > 0 && (
              <Badge className="ml-1 bg-blue-600 text-white text-[10px] px-1.5 py-0">
                {selectedCount}
              </Badge>
            )}
            {(conditionFilter || search) && selectedCount === 0 && (
              <Badge className="ml-1 bg-blue-600 text-white text-[10px] px-1.5 py-0">
                LỌC
              </Badge>
            )}
            <ChevronDownIcon className="size-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 rounded-xl border-none shadow-xl">
          <DropdownMenuItem
            onClick={onExportAll}
            disabled={isExporting}
            className="cursor-pointer rounded-lg py-3 px-4 font-semibold"
          >
            <FileDownIcon className="size-4 mr-2" />
            <div className="flex flex-col items-start">
              <span>Xuất tất cả</span>
              {(conditionFilter || search) && (
                <span className="text-[10px] text-slate-500 font-normal">
                  Áp dụng bộ lọc hiện tại
                </span>
              )}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onExportSelected}
            disabled={isExporting || selectedCount === 0}
            className="cursor-pointer rounded-lg py-3 px-4 font-semibold"
          >
            <FileDownIcon className="size-4 mr-2" />
            <div className="flex flex-col items-start">
              <span>Xuất cây đã chọn</span>
              <span className="text-[10px] text-slate-500 font-normal">
                {selectedCount > 0
                  ? `${selectedCount} cây được chọn`
                  : "Chưa chọn cây nào"}
              </span>
            </div>
          </DropdownMenuItem>
          {(conditionFilter || search) && (
            <div className="px-4 py-2 text-xs text-slate-500 border-t mt-1">
              <div className="font-semibold mb-1">Bộ lọc đang áp dụng:</div>
              {conditionFilter && (
                <div className="flex items-center gap-1">
                  <FilterIcon className="size-3" />
                  Tình trạng: <span className="font-bold">{conditionFilter}</span>
                </div>
              )}
              {search && (
                <div className="flex items-center gap-1">
                  <SearchIcon className="size-3" />
                  Tìm kiếm: <span className="font-bold">{search}</span>
                </div>
              )}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isAdmin && (
        <Button
          onClick={onAdd}
          className="bg-green-600 hover:bg-green-700 h-11 px-6 rounded-2xl shadow-lg shadow-green-600/20 font-bold gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <PlusIcon className="size-5" /> THÊM CÂY MỚI
        </Button>
      )}
    </div>
  )
}

// --- Card filter bar (inside the card header) ---

interface TreeFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  conditionFilter: string
  onConditionFilterChange: (value: string) => void
  totalCount: number
}

const conditions = [
  { value: "Tốt", color: "bg-green-500", activeClass: "bg-green-100 text-green-700" },
  { value: "Bình thường", color: "bg-blue-500", activeClass: "bg-blue-100 text-blue-700" },
  { value: "Sắp bệnh", color: "bg-amber-500", activeClass: "bg-amber-100 text-amber-700" },
  { value: "Mới trồng", color: "bg-cyan-500", activeClass: "bg-cyan-100 text-cyan-700" },
  { value: "Cần cắt tỉa", color: "bg-orange-500", activeClass: "bg-orange-100 text-orange-700" },
  { value: "Yếu", color: "bg-red-500", activeClass: "bg-red-100 text-red-700" },
  { value: "Cần thay thế", color: "bg-rose-500", activeClass: "bg-rose-100 text-rose-700" },
]

export function TreeFilterBar({
  search,
  onSearchChange,
  conditionFilter,
  onConditionFilterChange,
  totalCount,
}: TreeFilterBarProps) {
  return (
    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-600/30">
          <TreePineIcon className="size-4" />
        </div>
        <h3 className="text-sm font-black uppercase text-slate-600 tracking-widest">Danh mục ({totalCount})</h3>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-80">
          <SearchIcon className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input
            className="pl-9 bg-slate-100/50 border-none h-10 rounded-xl focus-visible:ring-green-500"
            placeholder="Tìm mã số, tên hoặc loài cây..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-10 px-4 border-slate-200 rounded-xl hover:bg-slate-50 gap-2 font-semibold",
                conditionFilter && "bg-green-50 border-green-200 text-green-700"
              )}
            >
              <FilterIcon className="size-4" />
              {conditionFilter || "Lọc"}
              {conditionFilter && (
                <span className="ml-1 size-5 rounded-full bg-green-600 text-white text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-none shadow-xl">
            <DropdownMenuItem
              onClick={() => onConditionFilterChange("")}
              className={cn(
                "cursor-pointer rounded-lg py-3 px-4 font-semibold",
                !conditionFilter && "bg-slate-100"
              )}
            >
              Tất cả tình trạng
            </DropdownMenuItem>
            {conditions.map((c) => (
              <DropdownMenuItem
                key={c.value}
                onClick={() => onConditionFilterChange(c.value)}
                className={cn(
                  "cursor-pointer rounded-lg py-3 px-4 font-semibold",
                  conditionFilter === c.value && c.activeClass
                )}
              >
                <div className={cn("size-2 rounded-full mr-2", c.color)} />
                {c.value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
