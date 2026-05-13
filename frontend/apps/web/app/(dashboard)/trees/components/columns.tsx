"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { MoreHorizontal, TreePineIcon } from "lucide-react"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

export interface TreeRow {
  id: number
  name: string | null
  treeTypeId: number
  treeTypeName: string | null
  condition: string | null
  latitude: number | null
  longitude: number | null
}

const conditionStyles: Record<string, string> = {
  "Tốt": "bg-green-100 text-green-700",
  "Bình thường": "bg-blue-100 text-blue-700",
  "Sắp bệnh": "bg-amber-100 text-amber-700 animate-pulse",
  "Mới trồng": "bg-cyan-100 text-cyan-700",
  "Cần cắt tỉa": "bg-orange-100 text-orange-700",
  "Yếu": "bg-red-100 text-red-700",
  "Cần thay thế": "bg-rose-100 text-rose-700 animate-pulse",
}

interface MakeColumnsOptions {
  isAdmin: boolean
  onEdit: (tree: TreeRow) => void
  onDelete: (id: number) => void
}

export function makeColumns({ isAdmin, onEdit, onDelete }: MakeColumnsOptions): ColumnDef<TreeRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Chọn tất cả"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Chọn hàng"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "tree",
      accessorKey: "name",
      header: "Cây xanh",
      cell: ({ row }) => {
        const tree = row.original
        return (
          <Link href={`/trees/${tree.id}`} className="flex items-center gap-3 group/cell">
            <div className="size-12 rounded-2xl bg-white shadow-sm border border-slate-100 text-green-600 flex items-center justify-center group-hover/cell:bg-green-600 group-hover/cell:text-white transition-all duration-300">
              <TreePineIcon className="size-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 tracking-tight group-hover/cell:text-green-700">
                #{tree.id} • {tree.name || "Cây chưa đặt tên"}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Mã tài sản: TREE-{tree.id.toString().padStart(4, "0")}
              </p>
            </div>
          </Link>
        )
      },
    },
    {
      accessorKey: "treeTypeName",
      header: "Thông tin loại",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-700">{row.original.treeTypeName || "Chưa phân loại"}</p>
          <p className="text-[10px] text-slate-400 font-medium">Loài bản địa</p>
        </div>
      ),
    },
    {
      id: "location",
      header: "Vị trí",
      cell: ({ row }) => {
        const tree = row.original
        return (
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="text-[11px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              {tree.latitude?.toFixed(4)}, {tree.longitude?.toFixed(4)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "condition",
      header: "Tình trạng",
      cell: ({ row }) => {
        const condition = row.original.condition
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-black px-2.5 py-1 rounded-full border-none shadow-sm",
              condition ? (conditionStyles[condition] ?? "bg-slate-100 text-slate-500") : "bg-slate-100 text-slate-500"
            )}
          >
            {condition?.toUpperCase() || "KHÔNG RÕ"}
          </Badge>
        )
      },
      filterFn: (row, _id, value) => {
        if (!value || value === "") return true
        return row.original.condition === value
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Thao tác</span>,
      cell: ({ row }) => {
        const tree = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 data-[state=open]:bg-muted">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Mở menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem asChild>
                  <Link href={`/trees/${tree.id}`}>Xem chi tiết</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(tree)}>
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(tree.id)} className="text-destructive">
                      Xóa
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
