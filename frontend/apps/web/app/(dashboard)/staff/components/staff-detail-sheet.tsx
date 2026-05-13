"use client"

import {
  UsersIcon, Mail, Shield, History, Calendar, Star, Building2, MapPin,
  CheckSquareIcon
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Label } from "@workspace/ui/components/label"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"
import { getRoleLabel } from "@/lib/roles"

interface EmployeeDto {
  id: string;
  userName: string;
  email: string;
  fullName: string | null;
  status: number;
  role: string | null;
  phoneNumber?: string;
}

interface StaffDetailSheetProps {
  employee: EmployeeDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdmin: boolean
  onToggleStatus: () => void
  onUpdateRole: (role: string) => void
  onDelete: (id: string, e: React.MouseEvent) => void
}

export function StaffDetailSheet({
  employee, open, onOpenChange, isAdmin,
  onToggleStatus, onUpdateRole, onDelete
}: StaffDetailSheetProps) {
  if (!employee) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-l-[3rem]">
        <div className="h-full flex flex-col bg-slate-50">
          <div className="bg-blue-600 p-8 text-white relative">
            <Shield className="absolute top-8 right-8 size-24 opacity-10 rotate-12" />
            <SheetHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full px-3 py-1 font-bold">
                  #{employee.id.substring(0, 8)}
                </Badge>
                <Badge className={cn(
                  "border-none rounded-full px-3 py-1 font-bold",
                  employee.status === 1 ? "bg-green-400 text-white" : "bg-slate-400 text-white"
                )}>
                  {employee.status === 1 ? "HOẠT ĐỘNG" : "BỊ KHÓA"}
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
                <h4 className="text-xl font-black text-slate-800">{employee.fullName || "Chưa cập nhật"}</h4>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{getRoleLabel(employee.role ?? "NhanVien")}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Mail className="size-3.5" />
                    <span className="text-xs font-medium">{employee.email}</span>
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
                        variant={employee.role === r ? "default" : "outline"}
                        size="sm"
                        className={cn("rounded-xl font-bold text-[10px]", employee.role === r ? "bg-blue-600 shadow-md" : "border-slate-200")}
                        onClick={() => onUpdateRole(r)}
                      >
                        {getRoleLabel(r)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    className={cn("flex-1 h-12 rounded-2xl font-bold transition-all shadow-lg",
                      employee.status === 1 ? "bg-slate-800 hover:bg-slate-900 shadow-slate-800/20" : "bg-green-600 hover:bg-green-700 shadow-green-600/20"
                    )}
                    onClick={onToggleStatus}
                  >
                    {employee.status === 1 ? "KHÓA TÀI KHOẢN" : "MỞ KHÓA TÀI KHOẢN"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-200 h-12 rounded-2xl font-bold text-red-500 hover:bg-red-50 hover:border-red-100"
                    onClick={(e) => {
                      onDelete(employee.id, e as React.MouseEvent);
                      onOpenChange(false);
                    }}
                  >
                    XÓA NHÂN VIÊN
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
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

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
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
