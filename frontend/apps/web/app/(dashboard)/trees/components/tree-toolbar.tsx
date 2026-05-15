"use client"

import {
  SearchIcon,
  FilterIcon,
  FileDownIcon,
  ChevronDownIcon,
  PlusIcon,
  TreePineIcon,
  FileTextIcon,
} from "lucide-react"
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
  isExportingPdf: boolean
  isAdmin: boolean
  conditionFilter: string
  search: string
  onExportAll: () => void
  onExportSelected: () => void
  onExportPdf: () => void
  onAdd: () => void
}

export function TreeToolbarHeader({
  selectedCount,
  isExporting,
  isExportingPdf,
  isAdmin,
  conditionFilter,
  search,
  onExportAll,
  onExportSelected,
  onExportPdf,
  onAdd,
}: TreeToolbarHeaderProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onExportPdf}
        disabled={isExportingPdf}
        variant="outline"
        className="h-11 gap-2 rounded-2xl border-slate-700 px-6 font-bold text-slate-700 hover:bg-slate-100"
      >
        <FileTextIcon className="size-5" />
        {isExportingPdf ? "ĐANG XUẤT..." : "XUẤT PDF"}
        {selectedCount > 0 && (
          <Badge className="ml-1 bg-slate-700 px-1.5 py-0 text-[10px] text-white">
            {selectedCount}
          </Badge>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isExporting}
            variant="outline"
            className={cn(
              "h-11 gap-2 rounded-2xl border-blue-600 px-6 font-bold text-blue-600 hover:bg-blue-50",
              (conditionFilter || search || selectedCount > 0) && "bg-blue-50"
            )}
          >
            <FileDownIcon className="size-5" />
            {isExporting ? "ĐANG XUẤT..." : "XUẤT EXCEL"}
            {selectedCount > 0 && (
              <Badge className="ml-1 bg-blue-600 px-1.5 py-0 text-[10px] text-white">
                {selectedCount}
              </Badge>
            )}
            {(conditionFilter || search) && selectedCount === 0 && (
              <Badge className="ml-1 bg-blue-600 px-1.5 py-0 text-[10px] text-white">
                LỌC
              </Badge>
            )}
            <ChevronDownIcon className="ml-1 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-72 rounded-xl border-none shadow-xl"
        >
          <DropdownMenuItem
            onClick={onExportAll}
            disabled={isExporting}
            className="cursor-pointer rounded-lg px-4 py-3 font-semibold"
          >
            <FileDownIcon className="mr-2 size-4" />
            <div className="flex flex-col items-start">
              <span>Xuất tất cả</span>
              {(conditionFilter || search) && (
                <span className="text-[10px] font-normal text-slate-500">
                  Áp dụng bộ lọc hiện tại
                </span>
              )}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onExportSelected}
            disabled={isExporting || selectedCount === 0}
            className="cursor-pointer rounded-lg px-4 py-3 font-semibold"
          >
            <FileDownIcon className="mr-2 size-4" />
            <div className="flex flex-col items-start">
              <span>Xuất cây đã chọn</span>
              <span className="text-[10px] font-normal text-slate-500">
                {selectedCount > 0
                  ? `${selectedCount} cây được chọn`
                  : "Chưa chọn cây nào"}
              </span>
            </div>
          </DropdownMenuItem>
          {(conditionFilter || search) && (
            <div className="mt-1 border-t px-4 py-2 text-xs text-slate-500">
              <div className="mb-1 font-semibold">Bộ lọc đang áp dụng:</div>
              {conditionFilter && (
                <div className="flex items-center gap-1">
                  <FilterIcon className="size-3" />
                  Tình trạng:{" "}
                  <span className="font-bold">{conditionFilter}</span>
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
          className="h-11 gap-2 rounded-2xl bg-green-600 px-6 font-bold shadow-lg shadow-green-600/20 transition-all hover:scale-105 hover:bg-green-700 active:scale-95"
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
  {
    value: "Tốt",
    color: "bg-green-500",
    activeClass: "bg-green-100 text-green-700",
  },
  {
    value: "Bình thường",
    color: "bg-blue-500",
    activeClass: "bg-blue-100 text-blue-700",
  },
  {
    value: "Sắp bệnh",
    color: "bg-amber-500",
    activeClass: "bg-amber-100 text-amber-700",
  },
  {
    value: "Mới trồng",
    color: "bg-cyan-500",
    activeClass: "bg-cyan-100 text-cyan-700",
  },
  {
    value: "Cần cắt tỉa",
    color: "bg-orange-500",
    activeClass: "bg-orange-100 text-orange-700",
  },
  { value: "Yếu", color: "bg-red-500", activeClass: "bg-red-100 text-red-700" },
  {
    value: "Cần thay thế",
    color: "bg-rose-500",
    activeClass: "bg-rose-100 text-rose-700",
  },
]

export function TreeFilterBar({
  search,
  onSearchChange,
  conditionFilter,
  onConditionFilterChange,
  totalCount,
}: TreeFilterBarProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-slate-50 bg-white/40 p-6 md:flex-row md:items-center">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-green-600 text-white shadow-lg shadow-green-600/30">
          <TreePineIcon className="size-4" />
        </div>
        <h3 className="text-sm font-black tracking-widest text-slate-600 uppercase">
          Danh mục ({totalCount})
        </h3>
      </div>
      <div className="flex w-full gap-2 md:w-auto">
        <div className="relative flex-1 md:w-80">
          <SearchIcon className="absolute top-2.5 left-3 size-4 text-slate-400" />
          <Input
            className="h-10 rounded-xl border-none bg-slate-100/50 pl-9 focus-visible:ring-green-500"
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
                "h-10 gap-2 rounded-xl border-slate-200 px-4 font-semibold hover:bg-slate-50",
                conditionFilter && "border-green-200 bg-green-50 text-green-700"
              )}
            >
              <FilterIcon className="size-4" />
              {conditionFilter || "Lọc"}
              {conditionFilter && (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                  1
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl border-none shadow-xl"
          >
            <DropdownMenuItem
              onClick={() => onConditionFilterChange("")}
              className={cn(
                "cursor-pointer rounded-lg px-4 py-3 font-semibold",
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
                  "cursor-pointer rounded-lg px-4 py-3 font-semibold",
                  conditionFilter === c.value && c.activeClass
                )}
              >
                <div className={cn("mr-2 size-2 rounded-full", c.color)} />
                {c.value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
