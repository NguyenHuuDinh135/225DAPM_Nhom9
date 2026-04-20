"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Badge } from "@workspace/ui/components/badge"
import { type Tree } from "../data/schema"
import { DataTableColumnHeader } from "../../tasks/components/data-table-column-header"

const conditionVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Good: "default",
  Fair: "secondary",
  Poor: "destructive",
}

export const columns: ColumnDef<Tree>[] = [
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
    accessorKey: "treeTypeId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Loại cây (ID)" />,
    cell: ({ row }) => <span>{row.getValue("treeTypeId")}</span>,
  },
  {
    accessorKey: "condition",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tình trạng" />,
    cell: ({ row }) => {
      const val = row.getValue("condition") as string | null
      if (!val) return <span className="text-muted-foreground">—</span>
      return (
        <Badge variant={conditionVariant[val] ?? "outline"}>{val}</Badge>
      )
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
]
