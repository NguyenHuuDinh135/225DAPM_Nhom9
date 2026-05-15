"use client"

import * as React from "react"
import { Card } from "@workspace/ui/components/card"
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
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { apiClient } from "@/lib/api-client"
import { toast } from "@workspace/ui/components/sonner"
import { type RowSelectionState } from "@tanstack/react-table"

import { type TreeRow, makeColumns } from "./components/columns"
import { TreeDataTable } from "./components/tree-data-table"
import { TreeToolbarHeader, TreeFilterBar } from "./components/tree-toolbar"
import {
  TreeFormDialog,
  type TreeFormData,
} from "./components/tree-form-dialog"

const DEFAULT_FORM: TreeFormData = {
  name: "",
  treeTypeId: 1,
  condition: "Bình thường",
  latitude: 16.047,
  longitude: 108.206,
}

export default function TreesPage() {
  const { user } = useAuth()
  const isAdmin = !!(
    user &&
    (user.role === ROLES.DoiTruong || user.role === ROLES.GiamDoc)
  )

  const [trees, setTrees] = React.useState<TreeRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [conditionFilter, setConditionFilter] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [pagination, setPagination] = React.useState({
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [isExporting, setIsExporting] = React.useState(false)
  const [isExportingPdf, setIsExportingPdf] = React.useState(false)

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingTree, setEditingTree] = React.useState<TreeRow | null>(null)
  const [formData, setFormData] = React.useState<TreeFormData>(DEFAULT_FORM)

  // Delete state
  const [treeToDelete, setTreeToDelete] = React.useState<number | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const selectedTreeIds = React.useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((k) => rowSelection[k])
        .map((idx) => trees[parseInt(idx)]?.id)
        .filter(Boolean),
    [rowSelection, trees]
  )

  const loadTrees = React.useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: pageSize.toString(),
        searchTerm: search,
      })
      if (conditionFilter) {
        queryParams.append("condition", conditionFilter)
      }

      const data = await apiClient.get<Record<string, unknown>>(
        `/api/trees?${queryParams.toString()}`
      )
      const items =
        (data?.items as TreeRow[]) ||
        (Array.isArray(data) ? (data as TreeRow[]) : [])
      const totalCount = (data?.totalCount as number) || items.length
      const totalPages =
        (data?.totalPages as number) || Math.ceil(totalCount / pageSize)

      setTrees(items)
      setPagination({
        totalPages,
        totalCount,
        hasNextPage: (data?.hasNextPage as boolean) ?? page < totalPages,
        hasPreviousPage: (data?.hasPreviousPage as boolean) ?? page > 1,
      })
    } catch {
      setTrees([])
      toast.error("Lỗi kết nối", {
        description:
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra Backend đang chạy.",
      })
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, conditionFilter])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      loadTrees()
    }, 500)
    return () => clearTimeout(timer)
  }, [search, conditionFilter])

  React.useEffect(() => {
    loadTrees()
  }, [page])

  const handleOpenAdd = () => {
    setEditingTree(null)
    setFormData(DEFAULT_FORM)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (tree: TreeRow) => {
    setEditingTree(tree)
    setFormData({
      name: tree.name ?? "",
      treeTypeId: tree.treeTypeId,
      condition: tree.condition ?? "Bình thường",
      latitude: tree.latitude ?? 16.047,
      longitude: tree.longitude ?? 108.206,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editingTree) {
        await apiClient.put(`/api/trees/${editingTree.id}`, {
          ...formData,
          id: editingTree.id,
        })
        toast.success("Thành công", {
          description: "Đã cập nhật thông tin cây xanh.",
        })
      } else {
        await apiClient.post("/api/trees", formData)
        toast.success("Thành công", {
          description: "Đã thêm cây xanh mới vào hệ thống.",
        })
      }
      setIsDialogOpen(false)
      loadTrees()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể lưu thông tin cây xanh."
      toast.error("Lỗi", { description: message })
    }
  }

  const confirmDelete = async () => {
    if (treeToDelete === null) return
    setIsDeleting(true)
    try {
      await apiClient.delete(`/api/trees/${treeToDelete}`)
      toast.success("Đã xóa", {
        description: "Cây xanh đã được loại bỏ khỏi hệ thống.",
      })
      loadTrees()
      setTreeToDelete(null)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể xóa cây xanh này."
      toast.error("Lỗi xóa", { description: message })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportAll = async () => {
    setIsExporting(true)
    try {
      const queryParams = new URLSearchParams()
      if (conditionFilter) queryParams.append("condition", conditionFilter)
      if (search) queryParams.append("searchTerm", search)

      const response = await fetch(
        `/api/trees/export?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      )
      if (!response.ok) throw new Error("Không thể xuất file")

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      let filterDesc = ""
      if (conditionFilter) filterDesc += `_${conditionFilter}`
      if (search) filterDesc += `_TimKiem`
      a.download = `DanhSachCayXanh${filterDesc}_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      const filterMsg =
        conditionFilter || search
          ? ` theo bộ lọc${conditionFilter ? ` (${conditionFilter})` : ""}`
          : ""
      toast.success("Thành công", {
        description: `Đã xuất danh sách cây xanh${filterMsg} ra file Excel.`,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể xuất file Excel."
      toast.error("Lỗi", { description: message })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportSelected = async () => {
    if (selectedTreeIds.length === 0) {
      toast.error("Chưa chọn cây", {
        description: "Vui lòng chọn ít nhất một cây để xuất.",
      })
      return
    }
    setIsExporting(true)
    try {
      const response = await fetch("/api/trees/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          treeIds: selectedTreeIds,
          condition: null,
          searchTerm: null,
        }),
      })
      if (!response.ok) throw new Error("Không thể xuất file")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `DanhSachCayXanh_${selectedTreeIds.length}cay_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Thành công", {
        description: `Đã xuất ${selectedTreeIds.length} cây đã chọn ra file Excel.`,
      })
      setRowSelection({})
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể xuất file Excel."
      toast.error("Lỗi", { description: message })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPdfAll = () => {
    setIsExportingPdf(true)
    try {
      const params = new URLSearchParams()
      if (conditionFilter) params.append("condition", conditionFilter)
      if (search) params.append("searchTerm", search)
      params.append("autoPrint", "1")

      const url = `/trees-report?${params.toString()}`
      window.open(url, "_blank", "noopener,noreferrer")
    } finally {
      setIsExportingPdf(false)
    }
  }

  const handleExportPdfSelected = () => {
    if (selectedTreeIds.length === 0) {
      toast.error("Chưa chọn cây", {
        description: "Vui lòng chọn ít nhất một cây để xuất PDF.",
      })
      return
    }

    setIsExportingPdf(true)
    try {
      const params = new URLSearchParams()
      selectedTreeIds.forEach((id) => params.append("treeIds", id.toString()))
      params.append("autoPrint", "1")

      const url = `/trees-report?${params.toString()}`
      window.open(url, "_blank", "noopener,noreferrer")
    } finally {
      setIsExportingPdf(false)
    }
  }

  const columns = React.useMemo(
    () =>
      makeColumns({
        isAdmin,
        onEdit: handleOpenEdit,
        onDelete: setTreeToDelete,
      }),
    [isAdmin]
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Hệ thống Cây xanh
          </h1>
          <p className="text-sm font-medium text-slate-500 italic">
            Quản lý tài sản xanh và theo dõi hiện trạng sinh trưởng.
          </p>
        </div>
        <TreeToolbarHeader
          selectedCount={selectedTreeIds.length}
          isExporting={isExporting}
          isExportingPdf={isExportingPdf}
          isAdmin={isAdmin}
          conditionFilter={conditionFilter}
          search={search}
          onExportAll={handleExportAll}
          onExportSelected={handleExportSelected}
          onExportPdfAll={handleExportPdfAll}
          onExportPdfSelected={handleExportPdfSelected}
          onAdd={handleOpenAdd}
        />
      </div>

      <Card className="overflow-hidden rounded-[2rem] border-none bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
        <TreeFilterBar
          search={search}
          onSearchChange={setSearch}
          conditionFilter={conditionFilter}
          onConditionFilterChange={setConditionFilter}
          totalCount={pagination.totalCount}
        />

        <TreeDataTable
          columns={columns}
          data={trees}
          loading={loading}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
        />
      </Card>

      <TreeFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingTree={editingTree}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={treeToDelete !== null}
        onOpenChange={(open) => !open && setTreeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa cây xanh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cây xanh này không? (Lưu ý: Không thể
              xóa nếu cây có lịch sử bảo trì hoặc sự cố liên quan). Hành động
              này không thể hoàn tác.
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
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
