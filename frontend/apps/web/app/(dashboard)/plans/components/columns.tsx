"use client"

import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { type Plan } from "../data/schema"
import { DataTableColumnHeader } from "../../tasks/components/data-table-column-header"

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Draft: "outline",
  Approved: "default",
  Rejected: "destructive",
}

function RowActions({ row, onRefresh }: { row: { original: Plan }; onRefresh: () => void }) {
  const { user } = useAuth()
  const plan = row.original

  async function handleApprove() {
    const approverId = typeof window !== "undefined" ? (localStorage.getItem("user_id") ?? "") : ""
    await apiClient.put(`/api/planning/${plan.id}/approve`, { approverId })
    onRefresh()
  }

  async function handleDelete() {
    if (!confirm(`Xác nhận xóa kế hoạch "${plan.name}"?`)) return
    await apiClient.delete(`/api/planning/${plan.id}`)
    onRefresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 data-[state=open]:bg-muted">
          <MoreHorizontal />
          <span className="sr-only">Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {plan.status !== "Approved" && (
          <DropdownMenuItem onClick={handleApprove}>Duyệt kế hoạch</DropdownMenuItem>
        )}
        {user?.role === "Manager" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>Xóa</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function makeColumns(onRefresh: () => void): ColumnDef<Plan>[] {
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
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
      cell: ({ row }) => (
        <Link href={`/plans/${row.original.id}`} className="max-w-[280px] truncate font-medium hover:underline text-primary">
          {row.getValue("name") ?? "—"}
        </Link>
      ),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bắt đầu" />,
      cell: ({ row }) => {
        const v = row.getValue("startDate") as string | null
        return <span>{v ? new Date(v).toLocaleDateString("vi-VN") : "—"}</span>
      },
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kết thúc" />,
      cell: ({ row }) => {
        const v = row.getValue("endDate") as string | null
        return <span>{v ? new Date(v).toLocaleDateString("vi-VN") : "—"}</span>
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
      cell: ({ row }) => {
        const s = (row.getValue("status") as string | null) ?? "Draft"
        return <Badge variant={statusVariant[s] ?? "outline"}>{s}</Badge>
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "workCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Số công việc" />,
      cell: ({ row }) => <span>{row.getValue("workCount")}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => <RowActions row={row} onRefresh={onRefresh} />,
    },
  ]
}
