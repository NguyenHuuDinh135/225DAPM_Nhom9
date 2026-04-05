"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { HugeiconsIcon } from "@hugeicons/react"
import { DragDropVerticalIcon, CheckmarkCircle01Icon, Loading03Icon, MoreVerticalCircle01Icon, LeftToRightListBulletIcon, ArrowDown01Icon, Add01Icon, ArrowLeftDoubleIcon, ArrowLeft01Icon, ArrowRight01Icon, ArrowRightDoubleIcon, ChartUpIcon } from "@hugeicons/core-free-icons"

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
})

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <HugeiconsIcon icon={DragDropVerticalIcon} strokeWidth={2} className="size-3 text-muted-foreground" />
      <span className="sr-only">Kéo thả để sắp xếp</span>
    </Button>
  )
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Chọn dòng"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "header",
    header: "Tên công việc",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Phân loại",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground bg-muted/50">
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 font-medium border-border">
        {row.original.status === "Hoàn thành" ? (
          <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="fill-emerald-500 text-emerald-500 mr-1 size-3" />
        ) : (
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="text-amber-500 animate-spin mr-1 size-3" />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full text-end">Mục tiêu (Cây)</div>,
    cell: ({ row }) => (
      <form
         onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Mục tiêu
        </Label>
        <Input
          className="h-8 w-16 border-transparent bg-transparent text-end shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
          defaultValue={row.original.target}
          id={`${row.original.id}-target`}
        />
      </form>
    ),
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full text-end">Hạn mức (Ngày)</div>,
    cell: ({ row }) => (
      <form
         onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
          Hạn mức
        </Label>
        <Input
          className="h-8 w-16 border-transparent bg-transparent text-end shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
          defaultValue={row.original.limit}
          id={`${row.original.id}-limit`}
        />
      </form>
    ),
  },
  {
    accessorKey: "reviewer",
    header: "Người giám sát",
    cell: ({ row }) => {
      const isAssigned = row.original.reviewer !== "Chưa phân công"

      if (isAssigned) {
        return <span className="text-sm font-medium">{row.original.reviewer}</span>
      }

      return (
        <>
          <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
            Người giám sát
          </Label>
          <Select>
            <SelectTrigger
              className="w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              id={`${row.original.id}-reviewer`}
            >
              <SelectValue placeholder="Phân công ngay" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                <SelectItem value="Trần Minh Tuấn">Trần Minh Tuấn</SelectItem>
                <SelectItem value="Nguyễn Mai Anh">Nguyễn Mai Anh</SelectItem>
                <SelectItem value="Lê Văn Hải">Lê Văn Hải</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </>
      )
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <HugeiconsIcon icon={MoreVerticalCircle01Icon} strokeWidth={2} />
            <span className="sr-only">Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
          <DropdownMenuItem>Giao việc nhanh</DropdownMenuItem>
          <DropdownMenuItem>Đánh dấu ưu tiên</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Xóa công việc</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 data-[dragging=true]:bg-muted/50 data-[dragging=true]:shadow-md"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="danh-sach"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          Chế độ xem
        </Label>
        <Select defaultValue="danh-sach">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Chọn góc nhìn" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="danh-sach">Danh sách công việc</SelectItem>
              <SelectItem value="lich-su">Lịch sử bảo dưỡng</SelectItem>
              <SelectItem value="nhan-su">Quản lý nhân sự</SelectItem>
              <SelectItem value="tai-lieu">Tài liệu quy định</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-green-100 **:data-[slot=badge]:text-green-800 **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="danh-sach">Danh sách công việc</TabsTrigger>
          <TabsTrigger value="lich-su">
            Lịch sử <Badge variant="secondary" className="ml-1">5</Badge>
          </TabsTrigger>
          <TabsTrigger value="nhan-su">
            Nhân sự <Badge variant="secondary" className="ml-1">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="tai-lieu">Tài liệu đính kèm</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <HugeiconsIcon icon={LeftToRightListBulletIcon} strokeWidth={2} data-icon="inline-start" />
                Cột hiển thị
                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "header" ? "Tên công việc" : 
                       column.id === "type" ? "Phân loại" :
                       column.id === "status" ? "Trạng thái" :
                       column.id === "target" ? "Mục tiêu" :
                       column.id === "limit" ? "Hạn mức" : "Người giám sát"}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="bg-[#007B22] hover:bg-[#006400] text-white">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            <span className="hidden lg:inline">Thêm công việc</span>
          </Button>
        </div>
      </div>
      
      <TabsContent
        value="danh-sach"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border border-border shadow-sm">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/60">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan} className="text-foreground font-semibold">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không có dữ liệu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        
        {/* Pagination & Footer */}
        <div className="flex items-center justify-between px-2">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            Đã chọn {table.getFilteredSelectedRowModel().rows.length} /{" "}
            {table.getFilteredRowModel().rows.length} hàng.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium text-muted-foreground">
                Hiển thị
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium text-muted-foreground">
              Trang {table.getState().pagination.pageIndex + 1} / {" "}
              {table.getPageCount()}
            </div>
            <div className="ms-auto flex items-center gap-2 lg:ms-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Trang đầu</span>
                <HugeiconsIcon icon={ArrowLeftDoubleIcon} strokeWidth={2} />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Trang trước</span>
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Trang sau</span>
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Trang cuối</span>
                <HugeiconsIcon icon={ArrowRightDoubleIcon} strokeWidth={2} />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Empty States cho các Tab khác */}
      <TabsContent value="lich-su" className="flex flex-col px-4 lg:px-6">
        <div className="flex items-center justify-center aspect-[3/1] w-full flex-1 rounded-lg border border-dashed border-border bg-muted/10 text-muted-foreground">Chưa có lịch sử bảo dưỡng nào được ghi nhận.</div>
      </TabsContent>
      <TabsContent value="nhan-su" className="flex flex-col px-4 lg:px-6">
        <div className="flex items-center justify-center aspect-[3/1] w-full flex-1 rounded-lg border border-dashed border-border bg-muted/10 text-muted-foreground">Chưa có dữ liệu phân bổ nhân sự.</div>
      </TabsContent>
      <TabsContent value="tai-lieu" className="flex flex-col px-4 lg:px-6">
        <div className="flex items-center justify-center aspect-[3/1] w-full flex-1 rounded-lg border border-dashed border-border bg-muted/10 text-muted-foreground">Kéo thả tài liệu đính kèm (Ảnh khảo sát, quy trình cắt tỉa...) vào đây.</div>
      </TabsContent>
    </Tabs>
  )
}

// Dữ liệu giả lập cho biểu đồ trong Drawer (Chi tiết 1 công việc)
const drawerChartData = [
  { month: "Tháng 1", tien_do: 20 },
  { month: "Tháng 2", tien_do: 45 },
  { month: "Tháng 3", tien_do: 65 },
  { month: "Tháng 4", tien_do: 80 },
  { month: "Tháng 5", tien_do: 95 },
  { month: "Tháng 6", tien_do: 100 },
]

const drawerChartConfig = {
  tien_do: {
    label: "Mức độ hoàn thành (%)",
    color: "#007B22",
  },
} satisfies ChartConfig

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-start font-semibold text-green-800 hover:text-green-600">
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent className={isMobile ? "" : "w-[500px]"}>
        <DrawerHeader className="gap-1 bg-muted/30 border-b pb-4">
          <DrawerTitle className="text-xl text-green-800">{item.header}</DrawerTitle>
          <DrawerDescription>
            Chi tiết kế hoạch triển khai và theo dõi tiến độ chăm sóc.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-6 overflow-y-auto px-6 py-4 text-sm">
          {!isMobile && (
            <>
              <div className="bg-card border rounded-xl p-4 shadow-sm">
                <p className="font-semibold text-foreground mb-4">Biểu đồ tiến độ dự kiến</p>
                <ChartContainer config={drawerChartConfig} className="h-[140px] w-full">
                  <AreaChart
                    accessibilityLayer
                    data={drawerChartData}
                    margin={{ left: 0, right: 10 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      dataKey="tien_do"
                      type="step"
                      fill="var(--color-tien_do)"
                      fillOpacity={0.2}
                      stroke="var(--color-tien_do)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
                <div className="mt-4 flex gap-2 leading-none font-medium text-emerald-600">
                  Vượt tiến độ 15% so với tháng trước <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} className="size-4" />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* FORM CHỈNH SỬA CHI TIẾT */}
          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="header" className="font-semibold">Tên công việc / Tuyến đường</Label>
              <Input id="header" defaultValue={item.header} className="bg-muted/20" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="type" className="font-semibold">Phân loại</Label>
                <Select defaultValue={item.type}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Chọn phân loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Cắt tỉa">Cắt tỉa</SelectItem>
                      <SelectItem value="Bón phân">Bón phân</SelectItem>
                      <SelectItem value="Trồng mới">Trồng mới</SelectItem>
                      <SelectItem value="Khảo sát">Khảo sát</SelectItem>
                      <SelectItem value="Xử lý sâu bệnh">Xử lý sâu bệnh</SelectItem>
                      <SelectItem value="Bảo dưỡng">Bảo dưỡng</SelectItem>
                      <SelectItem value="Gia cố">Gia cố</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status" className="font-semibold">Trạng thái</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                      <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                      <SelectItem value="Chưa bắt đầu">Chưa bắt đầu</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="target" className="font-semibold">Mục tiêu (Số cây)</Label>
                <Input id="target" defaultValue={item.target} type="number" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="limit" className="font-semibold">Hạn mức (Ngày)</Label>
                <Input id="limit" defaultValue={item.limit} type="number" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="reviewer" className="font-semibold">Người giám sát / Chịu trách nhiệm</Label>
              <Select defaultValue={item.reviewer}>
                <SelectTrigger id="reviewer" className="w-full">
                  <SelectValue placeholder="Chọn người phụ trách" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Trần Minh Tuấn">Trần Minh Tuấn (Khu vực 1)</SelectItem>
                    <SelectItem value="Nguyễn Mai Anh">Nguyễn Mai Anh (Khu vực 2)</SelectItem>
                    <SelectItem value="Lê Văn Hải">Lê Văn Hải (Khu vực 3)</SelectItem>
                    <SelectItem value="Chưa phân công" className="text-muted-foreground italic">Chưa phân công</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DrawerFooter className="border-t bg-muted/10 flex-row justify-end gap-2">
          <DrawerClose asChild>
            <Button variant="outline">Hủy bỏ</Button>
          </DrawerClose>
          <Button className="bg-[#007B22] hover:bg-[#006400] text-white">Lưu thay đổi</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}