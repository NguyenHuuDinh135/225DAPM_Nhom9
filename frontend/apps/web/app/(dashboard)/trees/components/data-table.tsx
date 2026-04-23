"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
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
import { TreeFormDialog } from "./tree-form-dialog"
import { ImportTreesDialog } from "./import-trees-dialog"
import { makeColumns } from "./columns"
import { type Tree } from "../data/schema"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

interface DataTableProps {
  data: Tree[]
}

export function DataTable({ data: initialData }: DataTableProps) {
  const [data, setData] = React.useState(initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editTree, setEditTree] = React.useState<Tree | undefined>()

  async function refresh() {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const res = await fetch(`${BASE_URL}/api/trees`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) setData(await res.json() as Tree[])
  }

  function handleEdit(tree: Tree) {
    setEditTree(tree)
    setDialogOpen(true)
  }

  const columns = React.useMemo(() => makeColumns(handleEdit, refresh), [])

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
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Tìm theo tên cây..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
            className="h-8 w-[200px] lg:w-[280px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
          <ImportTreesDialog onSuccess={refresh} />
          <Button size="sm" onClick={() => { setEditTree(undefined); setDialogOpen(true) }}>
            <Plus className="mr-1 size-4" /> Thêm cây
          </Button>
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

      <TreeFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditTree(undefined) }}
        tree={editTree}
        onSuccess={refresh}
      />
    </div>
  )
}
