"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { apiClient } from "@/lib/api-client"
import { type Incident, STATUSES } from "../data/schema"
import { DataTableColumnHeader } from "../../tasks/components/data-table-column-header"

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  InProgress: "secondary",
  Resolved: "default",
}

const statusLabel: Record<string, string> = {
  Pending: "Chờ xử lý",
  InProgress: "Đang xử lý",
  Resolved: "Đã giải quyết",
}

function RowActions({ row, onRefresh, canChangeStatus }: { row: { original: Incident }; onRefresh: () => void; canChangeStatus: boolean }) {
  const incident = row.original

  async function changeStatus(status: string) {
    await apiClient.put(`/api/tree-incidents/${incident.id}/status`, { id: incident.id, status })
    onRefresh()
  }

  if (!canChangeStatus) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 data-[state=open]:bg-muted">
          <MoreHorizontal />
          <span className="sr-only">Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Đổi trạng thái</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {STATUSES.filter((s) => s !== incident.status).map((s) => (
              <DropdownMenuItem key={s} onClick={() => changeStatus(s)}>
                {statusLabel[s]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function makeColumns(onRefresh: () => void, canChangeStatus = true): ColumnDef<Incident>[] {
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
      accessorKey: "treeId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID Cây" />,
      cell: ({ row }) => <span className="font-mono">#{row.getValue("treeId")}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "treeName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tên cây" />,
      cell: ({ row }) => <span>{row.getValue("treeName") ?? "—"}</span>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mô tả" />,
      cell: ({ row }) => (
        <span className="max-w-[300px] truncate block">{row.getValue("description") ?? "—"}</span>
      ),
    },
    {
      accessorKey: "reportedBy",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Người báo cáo" />,
      cell: ({ row }) => <span>{row.getValue("reportedBy") ?? "—"}</span>,
    },
    {
      accessorKey: "reportedDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày báo cáo" />,
      cell: ({ row }) => (
        <span>{new Date(row.getValue("reportedDate")).toLocaleDateString("vi-VN")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      cell: ({ row }) => {
        const s = (row.getValue("status") as string | null) ?? "Pending"
        return <Badge variant={statusVariant[s] ?? "outline"}>{statusLabel[s] ?? s}</Badge>
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: "actions",
      cell: ({ row }) => <RowActions row={row} onRefresh={onRefresh} canChangeStatus={canChangeStatus} />,
    },
  ]
}
