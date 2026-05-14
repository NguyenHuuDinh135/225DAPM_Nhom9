"use client"

import { Shield } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@workspace/ui/components/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@workspace/ui/components/select"

interface EmployeeDto {
  id: string;
  userName: string;
  email: string;
  fullName: string | null;
  status: number;
  role: string | null;
  phoneNumber?: string;
}

interface StaffFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingEmp: EmployeeDto | null
  formData: {
    email: string
    password: string
    fullName: string
    role: string
  }
  onFormDataChange: (data: { email: string; password: string; fullName: string; role: string }) => void
  onSubmit: () => void
}

export function StaffFormDialog({
  open, onOpenChange, editingEmp, formData, onFormDataChange, onSubmit
}: StaffFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onChange={(e) => onFormDataChange({...formData, email: e.target.value})}
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
                  onChange={(e) => onFormDataChange({...formData, password: e.target.value})}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label className="text-xs font-black uppercase text-slate-400 px-1">Họ và tên</Label>
              <Input
                placeholder="Ví dụ: Nguyễn Văn A"
                className="rounded-2xl border-slate-100 bg-slate-50 h-12 font-medium"
                value={formData.fullName}
                onChange={(e) => onFormDataChange({...formData, fullName: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-black uppercase text-slate-400 px-1">Vai trò hệ thống</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => onFormDataChange({...formData, role: val})}
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
              onClick={onSubmit}
              className="w-full rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              {editingEmp ? "CẬP NHẬT THÔNG TIN" : "KHỞI TẠO TÀI KHOẢN"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
