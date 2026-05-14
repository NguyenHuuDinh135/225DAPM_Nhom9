"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { apiClient } from "@/lib/api-client"
import { toast } from "@workspace/ui/components/sonner"

import { StaffStats } from "./components/staff-stats"
import { StaffDataTable } from "./components/staff-data-table"
import { StaffFormDialog } from "./components/staff-form-dialog"
import { StaffDetailSheet } from "./components/staff-detail-sheet"

interface EmployeeDto {
  id: string;
  userName: string;
  email: string;
  fullName: string | null;
  status: number;
  role: string | null;
  phoneNumber?: string;
}

export default function StaffPage() {
  const { user } = useAuth()
  const isAdmin = !!(user && (user.role === ROLES.DoiTruong || user.role === ROLES.GiamDoc));

  const [employees, setEmployees] = React.useState<EmployeeDto[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingEmp, setEditingEmp] = React.useState<EmployeeDto | null>(null)
  const [formData, setFormData] = React.useState({ email: "", password: "", fullName: "", role: "NhanVien" })

  // Detail Sheet state
  const [selectedEmp, setSelectedEmp] = React.useState<EmployeeDto | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  // Delete state
  const [employeeToDelete, setEmployeeToDelete] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<{employees: EmployeeDto[]}>("/api/employees")
      setEmployees(data.employees || [])
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      toast.error("Lỗi", {
        description: status === 403 ? "Bạn không có quyền truy cập danh sách này." : "Không thể tải danh sách nhân viên."
      })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadEmployees() }, [])

  const handleOpenAdd = () => {
    setEditingEmp(null)
    setFormData({ email: "", password: "", fullName: "", role: "NhanVien" })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (emp: EmployeeDto, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingEmp(emp)
    setFormData({ email: emp.email, password: "", fullName: emp.fullName ?? "", role: emp.role ?? "NhanVien" })
    setIsDialogOpen(true)
  }

  const handleViewDetail = (emp: EmployeeDto) => {
    setSelectedEmp(emp)
    setIsSheetOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editingEmp) {
        await apiClient.put(`/api/employees/${editingEmp.id}`, {
          userId: editingEmp.id,
          fullName: formData.fullName,
          status: editingEmp.status
        })
        toast.success("Thành công", { description: "Đã cập nhật thông tin nhân viên." })
      } else {
        await apiClient.post("/api/employees", {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role
        })
        toast.success("Thành công", { description: "Đã tạo tài khoản nhân viên mới." })
      }
      setIsDialogOpen(false)
      loadEmployees()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Có lỗi xảy ra khi lưu thông tin."
      toast.error("Lỗi", { description: Array.isArray(msg) ? msg[0] : msg })
    }
  }

  const handleToggleStatus = async () => {
    if (!selectedEmp) return
    const newStatus = selectedEmp.status === 1 ? 0 : 1
    try {
      await apiClient.put(`/api/employees/${selectedEmp.id}`, {
        userId: selectedEmp.id,
        fullName: selectedEmp.fullName,
        status: newStatus
      })
      toast.success(newStatus === 1 ? "Đã mở khóa" : "Đã khóa tài khoản")
      setIsSheetOpen(false)
      loadEmployees()
    } catch {
      toast.error("Thao tác thất bại")
    }
  }

  const handleUpdateRole = async (newRole: string) => {
    if (!selectedEmp) return
    try {
      await apiClient.put(`/api/employees/${selectedEmp.id}/roles`, {
        userId: selectedEmp.id,
        role: newRole
      })
      toast.success("Đã cập nhật vai trò")
      setIsSheetOpen(false)
      loadEmployees()
    } catch {
      toast.error("Không thể thay đổi vai trò")
    }
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEmployeeToDelete(id)
  }

  const confirmDelete = async () => {
    if (!employeeToDelete) return
    setIsDeleting(true)
    try {
      await apiClient.delete(`/api/employees/${employeeToDelete}`)
      toast.success("Đã gỡ bỏ tài khoản nhân viên")
      loadEmployees()
      setEmployeeToDelete(null)
    } catch {
      toast.error("Không thể xóa nhân viên này")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Hồ sơ Nhân sự</h1>
          <p className="text-sm text-slate-500 font-medium italic">Vận hành và quản lý đội ngũ tác nghiệp.</p>
        </div>

        {isAdmin && (
          <Button
            onClick={handleOpenAdd}
            className="h-11 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 font-bold gap-3 transition-all hover:scale-105"
          >
            <PlusIcon className="size-5" /> THÊM NHÂN VIÊN
          </Button>
        )}
      </div>

      <StaffStats employees={employees} />

      <StaffDataTable
        employees={employees}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onRowClick={handleViewDetail}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isAdmin={isAdmin}
        currentUserEmail={user?.email}
      />

      <StaffDetailSheet
        employee={selectedEmp}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        isAdmin={isAdmin}
        onToggleStatus={handleToggleStatus}
        onUpdateRole={handleUpdateRole}
        onDelete={handleDelete}
      />

      <StaffFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingEmp={editingEmp}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản nhân viên này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => { e.preventDefault(); confirmDelete() }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
