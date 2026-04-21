"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api-client"
import { type EmployeeDto } from "../page"
import { EmployeeFormDialog } from "./employee-form-dialog"
import { AssignRoleDialog } from "./assign-role-dialog"

const ROLE_LABELS: Record<string, string> = {
  Administrator: "Quản trị viên",
  Admin: "Admin",
  Manager: "Quản lý",
  Employee: "Nhân viên",
}

export function StaffClient({ employees: initial }: { employees: EmployeeDto[] }) {
  const { user } = useAuth()
  const isAdmin = user?.role === "Admin" || user?.role === "Administrator"

  const [data, setData] = React.useState(initial)
  const [filter, setFilter] = React.useState("")
  const [formOpen, setFormOpen] = React.useState(false)
  const [roleOpen, setRoleOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<EmployeeDto | undefined>()

  async function refresh() {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const res = await fetch(`${BASE_URL}/api/employees`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) {
      const json = await res.json() as { employees: EmployeeDto[] }
      setData(json.employees)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xác nhận xóa nhân viên này?")) return
    await apiClient.delete(`/api/employees/${id}`)
    await refresh()
  }

  const columns: ColumnDef<EmployeeDto>[] = [
    {
      accessorKey: "fullName",
      header: "Họ tên",
      cell: ({ row }) => <span className="font-medium">{row.getValue("fullName") || row.original.userName || "—"}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("email") ?? "—"}</span>,
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => {
        const role = row.getValue("role") as string | undefined
        return role ? <Badge variant="secondary">{ROLE_LABELS[role] ?? role}</Badge> : <span className="text-muted-foreground">—</span>
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const active = row.getValue("status") === 1
        return <Badge variant={active ? "default" : "outline"}>{active ? "Hoạt động" : "Không hoạt động"}</Badge>
      },
    },
    ...(isAdmin ? [{
      id: "actions",
      header: "",
      cell: ({ row }: { row: { original: EmployeeDto } }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button size="icon" variant="ghost" onClick={() => { setSelected(row.original); setFormOpen(true) }}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => { setSelected(row.original); setRoleOpen(true) }}>
            <ShieldCheck className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    } as ColumnDef<EmployeeDto>] : []),
  ]

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter: filter },
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Tìm kiếm nhân viên..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 w-[240px]"
        />
        {isAdmin && (
          <Button size="sm" onClick={() => { setSelected(undefined); setFormOpen(true) }}>
            <Plus className="mr-1 size-4" /> Thêm nhân viên
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">Không có dữ liệu.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={selected}
        onSuccess={refresh}
      />
      {selected && (
        <AssignRoleDialog
          open={roleOpen}
          onOpenChange={setRoleOpen}
          employee={selected}
          onSuccess={refresh}
        />
      )}
    </div>
  )
}
