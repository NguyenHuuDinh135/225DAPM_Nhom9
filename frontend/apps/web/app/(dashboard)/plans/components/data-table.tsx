"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
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
import { Plus } from "lucide-react"
import { DataTablePagination } from "../../tasks/components/data-table-pagination"
import { DataTableViewOptions } from "../../tasks/components/data-table-view-options"
import { PlanFormDialog } from "./plan-form-dialog"
import { makeColumns } from "./columns"
import { type Plan } from "../data/schema"
import { useAuth } from "@/hooks/use-auth"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export function DataTable({ data: initialData }: { data: Plan[] }) {
  const { user } = useAuth()
  
  console.log("👤 Current user:", user)
  console.log("🔑 User role:", user?.role)
  
  const canCreate = user?.role === "Administrator" || user?.role === "Manager" || user?.role === "Admin"
  
  console.log("✅ Can create plan:", canCreate)
  const [data, setData] = React.useState(initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)

  async function refresh() {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const res = await fetch(`${BASE_URL}/api/planning`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) setData(await res.json() as Plan[])
  }

  const columns = React.useMemo(() => makeColumns(refresh), [])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters },
    initialState: { pagination: { pageSize: 25 } },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Tìm theo tiêu đề..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
            className="h-8 w-[200px] lg:w-[280px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
          {canCreate && (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1 size-4" /> Tạo kế hoạch
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} colSpan={h.colSpan}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      <PlanFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={refresh} />
    </div>
  )
}
