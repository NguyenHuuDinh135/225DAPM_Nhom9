"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { statuses } from "../data/data"
import { type WorkItem } from "../data/schema"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<WorkItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="w-[60px]">#{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "workTypeName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Loại công việc" />,
    cell: ({ row }) => {
      const workId = row.getValue("id") as number
      return (
        <a 
          href={`/works/${workId}`}
          className="max-w-[300px] truncate font-medium hover:underline text-primary"
        >
          {row.getValue("workTypeName") ?? "—"}
        </a>
      )
    },
  },
  {
    accessorKey: "planName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kế hoạch" />,
    cell: ({ row }) => <span>{row.getValue("planName") ?? "—"}</span>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => {
      const status = statuses.find((s) => s.value === row.getValue("status"))
      if (!status) return <span>{row.getValue("status")}</span>
      return (
        <div className="flex w-[140px] items-center gap-2">
          <status.icon className="size-4 text-muted-foreground" />
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Bắt đầu" />,
    cell: ({ row }) => {
      const val = row.getValue("startDate") as string | null
      return <span>{val ? new Date(val).toLocaleDateString("vi-VN") : "—"}</span>
    },
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kết thúc" />,
    cell: ({ row }) => {
      const val = row.getValue("endDate") as string | null
      return <span>{val ? new Date(val).toLocaleDateString("vi-VN") : "—"}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
