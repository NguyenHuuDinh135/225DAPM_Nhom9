"use client"

import * as React from "react"
import { 
  UsersIcon, PlusIcon, SearchIcon, ChevronRightIcon, 
  UserCheckIcon, Loader2, Mail, Shield, Edit2, Trash2,
  ChevronLeft, ChevronRight, History, Calendar, Star, Building2, MapPin,
  CheckSquareIcon
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@workspace/ui/components/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@workspace/ui/components/dialog"
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
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@workspace/ui/components/sheet"
import { Label } from "@workspace/ui/components/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@workspace/ui/components/select"
import { useAuth } from "@/hooks/use-auth"
import { ROLES, getRoleLabel } from "@/lib/roles"
import { apiClient } from "@/lib/api-client"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

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
  const isAdmin = user && (user.role === ROLES.DoiTruong || user.role === ROLES.GiamDoc);

  const [employees, setEmployees] = React.useState<EmployeeDto[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingEmp, setEditingEmp] = React.useState<EmployeeDto | null>(null)
  
  // Detail Sheet state
  const [selectedEmp, setSelectedEmp] = React.useState<EmployeeDto | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    fullName: "",
    role: "NhanVien"
  })

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<{employees: EmployeeDto[]}>("/api/employees")
      setEmployees(data.employees || [])
    } catch (err: any) {
      console.error("Load employees error:", err)
      toast.error("Lỗi", { 
        description: err.status === 403 ? "Bạn không có quyền truy cập danh sách này." : "Không thể tải danh sách nhân viên." 
      })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadEmployees()
  }, [])

  const handleOpenAdd = () => {
    setEditingEmp(null)
    setFormData({ email: "", password: "", fullName: "", role: "NhanVien" })
    setIsDialogOpen(true)
    // Don't clear search here unless specifically asked, but user said it "pollutes" 
    // maybe they meant the form data was using search state? 
    // Actually, I'll make sure search doesn't affect the form.
  }

  const handleOpenEdit = (emp: EmployeeDto, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingEmp(emp)
    setFormData({ 
      email: emp.email, 
      password: "", 
      fullName: emp.fullName ?? "", 
      role: emp.role ?? "NhanVien" 
    })
    setIsDialogOpen(true)
  }

  const handleViewDetail = (emp: EmployeeDto) => {
    setSelectedEmp(emp)
    setIsSheetOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editingEmp) {
        // API PUT /api/employees/{id} expects UpdateEmployeeCommand { UserId, FullName, Status }
        await apiClient.put(`/api/employees/${editingEmp.id}`, {
            userId: editingEmp.id,
            fullName: formData.fullName,
            status: editingEmp.status
        })
        toast.success("Thành công", { description: "Đã cập nhật thông tin nhân viên." })
      } else {
        // API POST /api/employees expects CreateEmployeeCommand { Email, Password, FullName, Role }
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
    } catch (err: any) {
      const msg = err.message || "Có lỗi xảy ra khi lưu thông tin."
      toast.error("Lỗi", { description: Array.isArray(msg) ? msg[0] : msg })
    }
  }

  const handleToggleStatus = async () => {
    if (!selectedEmp) return
    const newStatus = selectedEmp.status === 1 ? 0 : 1 // 1: Active, 0: Inactive
    try {
      await apiClient.put(`/api/employees/${selectedEmp.id}`, {
        userId: selectedEmp.id,
        fullName: selectedEmp.fullName,
        status: newStatus
      })
      toast.success(newStatus === 1 ? "Đã mở khóa" : "Đã khóa tài khoản")
      setIsSheetOpen(false)
      loadEmployees()
    } catch (err) {
      toast.error("Thao tác thất bại")
    }
  }

  const [employeeToDelete, setEmployeeToDelete] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

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
    } catch (err) {
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
    } catch (err) {
      toast.error("Không thể xóa nhân viên này")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredEmployees = employees.filter(e => 
    !search || 
    e.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    e.email.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filteredEmployees.length / pageSize)

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 1).length,
    admins: employees.filter(e => e.role === ROLES.DoiTruong || e.role === ROLES.GiamDoc).length
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard icon={UsersIcon} label="Tổng nhân sự" value={stats.total.toString()} color="blue" />
        <StatusCard icon={Shield} label="Ban điều hành" value={stats.admins.toString()} color="orange" />
        <StatusCard icon={UserCheckIcon} label="Đang tác nghiệp" value={stats.active.toString()} color="green" />
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Danh sách nhân sự ({filteredEmployees.length})</h3>
          <div className="relative w-full md:w-96 group">
            <SearchIcon className="absolute left-3.5 top-3 size-4 text-slate-400" />
            <Input 
              className="pl-11 h-11 text-xs rounded-xl border-none bg-slate-100/50 focus-visible:ring-blue-500" 
              placeholder="Tìm kiếm theo tên hoặc email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-[10px] font-black uppercase text-slate-400 px-6">Họ tên & Tài khoản</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-slate-400">Vai trò</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-slate-400">Trạng thái</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase text-slate-400 px-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="size-10 animate-spin text-blue-600" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải đội ngũ...</p>
                        </div>
                    </TableCell>
                </TableRow>
            ) : paginatedEmployees.length > 0 ? (
                paginatedEmployees.map(emp => (
                    <TableRow 
                        key={emp.id} 
                        className="group hover:bg-blue-50/30 transition-colors border-slate-50 cursor-pointer"
                        onClick={() => handleViewDetail(emp)}
                    >
                        <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <UsersIcon className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{emp.fullName || "Chưa cập nhật tên"}</p>
                                    <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                                        <Mail className="size-3" />
                                        <span className="text-[11px] font-medium">{emp.email}</span>
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white border-slate-200 text-slate-600 shadow-sm">
                                {getRoleLabel(emp.role ?? "NhanVien")}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className={cn("size-2 rounded-full", emp.status === 1 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-slate-300")} />
                                <span className="text-[11px] font-bold text-slate-600">{emp.status === 1 ? "ĐANG HOẠT ĐỘNG" : "BỊ KHÓA"}</span>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isAdmin && emp.email !== user?.email && (
                                    <>
                                        <Button variant="ghost" size="icon" className="size-9 rounded-xl text-blue-600 hover:bg-blue-50" onClick={(e) => handleOpenEdit(emp, e)}>
                                            <Edit2 className="size-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="size-9 rounded-xl text-red-600 hover:bg-red-50" onClick={(e) => handleDelete(emp.id, e)}>
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </>
                                )}
                                <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-400">
                                    <ChevronRightIcon className="size-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center text-slate-400 italic font-medium">
                        Không tìm thấy nhân viên nào phù hợp.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Hiển thị {paginatedEmployees.length} / {filteredEmployees.length} nhân sự
                </p>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <div className="flex items-center gap-1 mx-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <Button 
                                key={i}
                                variant={page === i + 1 ? "default" : "ghost"}
                                className={cn("h-9 w-9 rounded-xl text-xs font-bold", page === i + 1 ? "bg-blue-600 shadow-lg shadow-blue-600/20" : "")}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        )}
      </Card>

      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-l-[3rem]">
          {selectedEmp && (
            <div className="h-full flex flex-col bg-slate-50">
              <div className="bg-blue-600 p-8 text-white relative">
                <Shield className="absolute top-8 right-8 size-24 opacity-10 rotate-12" />
                <SheetHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full px-3 py-1 font-bold">
                            #{selectedEmp.id.substring(0, 8)}
                        </Badge>
                        <Badge className="bg-green-400 text-white border-none rounded-full px-3 py-1 font-bold">
                            HOẠT ĐỘNG
                        </Badge>
                    </div>
                    <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        Hồ sơ Nhân sự
                    </SheetTitle>
                    <SheetDescription className="text-blue-100 font-medium">
                        Thông tin chi tiết và lịch sử tác nghiệp của nhân viên.
                    </SheetDescription>
                </SheetHeader>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Profile Overview */}
                <div className="flex items-center gap-6 bg-white p-6 rounded-[2rem] shadow-sm">
                    <div className="size-24 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <UsersIcon className="size-12" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-slate-800">{selectedEmp.fullName || "Chưa cập nhật"}</h4>
                        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{getRoleLabel(selectedEmp.role ?? "NhanVien")}</p>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Mail className="size-3.5" />
                                <span className="text-xs font-medium">{selectedEmp.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={Calendar} label="Ngày gia nhập" value="20/03/2024" />
                    <DetailItem icon={Building2} label="Bộ phận" value="Đội Duy trì Cây xanh" />
                    <DetailItem icon={MapPin} label="Khu vực trực" value="Hải Châu, Đà Nẵng" />
                    <DetailItem icon={Star} label="Xếp hạng" value="Xuất sắc" />
                </div>

                {/* Performance History (Mock) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-slate-400">
                            <History className="size-4" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Lịch sử tác nghiệp gần đây</h4>
                        </div>
                        <Button variant="link" className="text-[10px] font-black text-blue-600 uppercase tracking-widest p-0 h-auto">Xem tất cả</Button>
                    </div>
                    
                    <div className="space-y-3">
                        <HistoryItem 
                            title="Xử lý sự cố Cây gãy cành" 
                            date="Hôm qua, 14:30" 
                            status="Hoàn thành" 
                            tree="#T-1029"
                        />
                        <HistoryItem 
                            title="Cắt tỉa định kỳ Tuyến đường Nguyễn Văn Linh" 
                            date="12/04/2024" 
                            status="Hoàn thành" 
                            tree="15 cây"
                        />
                        <HistoryItem 
                            title="Kiểm tra sức khỏe Cây Di sản" 
                            date="05/04/2024" 
                            status="Hoàn thành" 
                            tree="#T-0042"
                        />
                    </div>
                </div>

                {isAdmin && (
                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Cập nhật Vai trò</Label>
                            <div className="flex flex-wrap gap-2">
                                {["NhanVien", "DoiTruong", "GiamDoc"].map((r) => (
                                    <Button 
                                        key={r}
                                        variant={selectedEmp.role === r ? "default" : "outline"}
                                        size="sm"
                                        className={cn("rounded-xl font-bold text-[10px]", selectedEmp.role === r ? "bg-blue-600 shadow-md" : "border-slate-200")}
                                        onClick={() => handleUpdateRole(r)}
                                    >
                                        {getRoleLabel(r)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button 
                                className={cn("flex-1 h-12 rounded-2xl font-bold transition-all shadow-lg", 
                                    selectedEmp.status === 1 ? "bg-slate-800 hover:bg-slate-900 shadow-slate-800/20" : "bg-green-600 hover:bg-green-700 shadow-green-600/20"
                                )}
                                onClick={handleToggleStatus}
                            >
                                {selectedEmp.status === 1 ? "KHÓA TÀI KHOẢN" : "MỞ KHÓA TÀI KHOẢN"}
                            </Button>
                            <Button 
                                variant="outline" 
                                className="flex-1 border-slate-200 h-12 rounded-2xl font-bold text-red-500 hover:bg-red-50 hover:border-red-100"
                                onClick={(e) => {
                                    handleDelete(selectedEmp.id, e as any);
                                    setIsSheetOpen(false);
                                }}
                            >
                                XÓA NHÂN VIÊN
                            </Button>
                        </div>
                    </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-blue-600 p-8 text-white relative">
            <Shield className="absolute top-6 right-8 size-16 opacity-10 rotate-12" />
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                {editingEmp ? "Cập nhật nhân sự" : "Thêm nhân viên mới"}
              </DialogTitle>
              <DialogDescription className="text-blue-100 font-medium">
                Phân quyền và thiết lập tài khoản tác nghiệp cho nhân viên.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-xs font-black uppercase text-slate-400 px-1">Email / Tên đăng nhập</Label>
                <Input 
                  placeholder="nhanvien@danangxanh.vn" 
                  className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-blue-500 h-12 font-medium"
                  disabled={!!editingEmp}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {!editingEmp && (
                <div className="grid gap-2">
                  <Label className="text-xs font-black uppercase text-slate-400 px-1">Mật khẩu khởi tạo</Label>
                  <Input 
                    type="password"
                    placeholder="••••••••" 
                    className="rounded-2xl border-slate-100 bg-slate-50 h-12 font-medium"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label className="text-xs font-black uppercase text-slate-400 px-1">Họ và tên</Label>
                <Input 
                  placeholder="Ví dụ: Nguyễn Văn A" 
                  className="rounded-2xl border-slate-100 bg-slate-50 h-12 font-medium"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-black uppercase text-slate-400 px-1">Vai trò hệ thống</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => setFormData({...formData, role: val})}
                >
                  <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12 font-medium">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <SelectItem value="NhanVien" className="font-bold text-xs">Nhân Viên Thực Địa</SelectItem>
                    <SelectItem value="DoiTruong" className="font-bold text-xs">Đội Trưởng</SelectItem>
                    <SelectItem value="GiamDoc" className="font-bold text-xs">Giám Đốc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                onClick={handleSubmit}
                className="w-full rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
              >
                {editingEmp ? "CẬP NHẬT THÔNG TIN" : "KHỞI TẠO TÀI KHOẢN"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  )
}

function StatusCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  const colors: any = {
    green: "bg-green-500/10 text-green-600 ring-green-500/20",
    orange: "bg-orange-500/10 text-orange-600 ring-orange-500/20",
    blue: "bg-blue-500/10 text-blue-600 ring-blue-500/20"
  }
  return (
    <Card className="p-6 flex items-center gap-5 hover:scale-[1.03] transition-all duration-300 cursor-default group border-none shadow-lg shadow-slate-200/50 rounded-3xl bg-white/50 backdrop-blur-sm">
      <div className={cn("size-14 rounded-2xl flex items-center justify-center ring-1 shadow-inner group-hover:scale-110 transition-transform duration-500", colors[color])}>
        <Icon className="size-7" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
      </div>
    </Card>
  )
}

function HistoryItem({ title, date, status, tree }: { title: string, date: string, status: string, tree: string }) {
  return (
      <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-50">
          <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <CheckSquareIcon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-800 line-clamp-1 uppercase tracking-tight">{title}</p>
              <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-slate-400 font-medium italic">{date}</span>
                  <span className="text-[10px] font-bold text-blue-600">{tree}</span>
              </div>
          </div>
          <Badge className="bg-green-100 text-green-600 border-none text-[8px] font-black">{status}</Badge>
      </div>
  )
}

function DetailItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Icon className="size-3" />
              <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
          </div>
          <p className="text-xs font-black text-slate-700">{value}</p>
      </div>
  )
}
