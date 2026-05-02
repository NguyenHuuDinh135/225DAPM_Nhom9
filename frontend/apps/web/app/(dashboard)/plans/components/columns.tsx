"use client"

import { useState } from "react"
import Link from "next/link"
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, EyeIcon } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { type Plan } from "../data/schema"
import { DataTableColumnHeader } from "../../tasks/components/data-table-column-header"

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Draft: "outline",
  PendingApproval: "secondary",
  NeedsRevision: "secondary",
  Approved: "default",
  Rejected: "destructive",
  Completed: "default",
  Cancelled: "outline",
}

function RowActions({ row, onRefresh }: { row: { original: Plan }; onRefresh: () => void }) {
  const { user } = useAuth()
  const plan = row.original
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function confirmDelete() {
    setIsDeleting(true)
    try {
      await apiClient.delete(`/api/planning/${plan.id}`)
      toast.success("Đã xóa kế hoạch")
      onRefresh()
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    setShowDeleteDialog(true)
  }

  return (
<<<<<<< HEAD
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 data-[state=open]:bg-muted">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem asChild>
            <Link href={`/plans/${plan.id}`}>Xem chi tiết</Link>
          </DropdownMenuItem>
          {user?.role === ROLES.DoiTruong && (plan.status === "Draft" || plan.status === "NeedsRevision") && (
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              Xóa kế hoạch
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Xác nhận xóa kế hoạch "{plan.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
=======
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 data-[state=open]:bg-muted">
          <MoreHorizontal />
          <span className="sr-only">Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <Link href={`/plans/${plan.id}`} className="flex items-center gap-2">
            <EyeIcon className="size-4" />
            Xem chi tiết
          </Link>
        </DropdownMenuItem>
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
>>>>>>> main
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
        const sn = row.original.statusName ?? s
        return <Badge variant={statusVariant[s] ?? "outline"}>{sn}</Badge>
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
