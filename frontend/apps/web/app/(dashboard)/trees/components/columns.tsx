"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Pencil, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { type Tree } from "../data/schema"
import { DataTableColumnHeader } from "../../tasks/components/data-table-column-header"
import { apiClient } from "@/lib/api-client"

const conditionVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Good: "default",
  Fair: "secondary",
  Poor: "destructive",
}

export function makeColumns(
  onEdit: (tree: Tree) => void,
  onRefresh: () => void
): ColumnDef<Tree>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mã cây" />,
      cell: ({ row }) => <span className="w-[60px] font-mono">#{row.getValue("id")}</span>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên cây" />,
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate font-medium">
          {row.getValue("name") ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "treeTypeName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Loại cây" />,
      cell: ({ row }) => <span>{row.getValue("treeTypeName") ?? `#${row.original.treeTypeId}`}</span>,
    },
    {
      accessorKey: "condition",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tình trạng" />,
      cell: ({ row }) => {
        const val = row.getValue("condition") as string | null
        if (!val) return <span className="text-muted-foreground">—</span>
        return <Badge variant={conditionVariant[val] ?? "outline"}>{val}</Badge>
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "lastMaintenanceDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bảo dưỡng gần nhất" />,
      cell: ({ row }) => {
        const val = row.getValue("lastMaintenanceDate") as string | null
        return <span>{val ? new Date(val).toLocaleDateString("vi-VN") : "—"}</span>
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const tree = row.original
        async function handleDelete() {
          if (!confirm(`Xác nhận xóa cây #${tree.id}?`)) return
          try {
            console.log('🗑️ Deleting tree:', tree.id)
            await apiClient.delete(`/api/trees/${tree.id}`)
            console.log('✅ Delete success')
          } catch (error: any) {
            console.error('❌ Delete error:', error)
            // Ignore error and refresh anyway - tree might be deleted
          }
          // Always refresh to see current state
          onRefresh()
        }
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button size="icon" variant="ghost" asChild>
              <Link href={`/trees/${tree.id}`}><Eye className="size-4" /></Link>
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onEdit(tree)}>
              <Pencil className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" className="text-destructive" onClick={handleDelete}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}

// Keep backward-compat export for existing page.tsx import
export const columns = makeColumns(() => {}, () => {})
