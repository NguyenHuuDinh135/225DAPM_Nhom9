"use client"

import * as React from "react"
import { Plus, Trash2, UserPlus, TreePine, Calendar, User, FileText, Loader2, ShieldCheck, ShieldAlert } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@workspace/ui/components/sheet"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@workspace/ui/components/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@workspace/ui/components/select"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanDto {
  id: number;
  name: string;
  creatorId: string;
  creatorName: string;
  startDate: string;
  endDate: string;
  status: string;
  workCount?: number;
}

interface PlanSheetProps {
  plan: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onRefresh: (plan: PlanDto) => void
  onPlansRefresh: () => void
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Draft: "bg-slate-100 text-slate-600",
    PendingApproval: "bg-primary/10 text-primary",
    NeedsRevision: "bg-orange-100 text-orange-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    InProgress: "bg-primary text-white",
    Completed: "bg-slate-500 text-white",
    New: "bg-blue-100 text-blue-700",
    WaitingForApproval: "bg-purple-100 text-purple-700",
  }
  const labels: Record<string, string> = {
    Draft: "BẢN NHÁP",
    PendingApproval: "CHỜ DUYỆT",
    NeedsRevision: "CẦN SỬA",
    Approved: "ĐÃ DUYỆT",
    Rejected: "BỊ TỪ CHỐI",
    InProgress: "ĐANG CHẠY",
    Completed: "HOÀN THÀNH",
    New: "MỚI",
    WaitingForApproval: "CHỜ DUYỆT",
  }
  return (
    <Badge variant="outline" className={cn("text-[9px] font-black px-2 py-0.5 rounded-lg border-none shadow-sm", styles[status])}>
      {labels[status] || status.toUpperCase()}
    </Badge>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PlanWorkSheet({ plan, isOpen, onOpenChange, onRefresh, onPlansRefresh }: PlanSheetProps) {
  const { user } = useAuth()

  // Work item management
  const [isCreateWorkDialogOpen, setIsCreateWorkDialogOpen] = React.useState(false)
  const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] = React.useState(false)
  const [selectedWorkId, setSelectedWorkId] = React.useState<number | null>(null)
  const [isDeleteWorkConfirmOpen, setIsDeleteWorkConfirmOpen] = React.useState(false)
  const [workToDelete, setWorkToDelete] = React.useState<number | null>(null)

  // Lookup data
  const [staffList, setStaffList] = React.useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([])
  const [newWorkType, setNewWorkType] = React.useState("")
  const [selectedTrees, setSelectedTrees] = React.useState<number[]>([])
  const [workTypes, setWorkTypes] = React.useState<any[]>([])
  const [availableTrees, setAvailableTrees] = React.useState<any[]>([])

  // Reason dialog (reject/revision)
  const [isReasonDialogOpen, setIsReasonDialogOpen] = React.useState(false)
  const [reasonAction, setReasonAction] = React.useState<"reject" | "revision" | null>(null)
  const [reasonText, setReasonText] = React.useState("")

  React.useEffect(() => {
    if (isOpen) loadLookups()
  }, [isOpen])

  const loadLookups = async () => {
    apiClient.get<any[]>("/api/Lookups/work-types")
      .then(setWorkTypes)
      .catch(() => {});
    apiClient.get<any>("/api/trees?pageSize=100")
      .then(res => setAvailableTrees(res.items || []))
      .catch(() => {});
    apiClient.get<any>("/api/employees")
      .then(res => setStaffList((res.employees || []).filter((e: any) => e.role === "NhanVien")))
      .catch(() => {});
  }

  const canEdit = (user?.role === ROLES.DoiTruong || user?.role === ROLES.GiamDoc) &&
    (plan?.status === "Draft" || plan?.status === "NeedsRevision" || plan?.status === "PendingApproval")

  const handleAssignUser = async (userId: string) => {
    if (!selectedWorkId) return
    try {
      await apiClient.post(`/api/work-items/${selectedWorkId}/assign-user`, {
        workId: selectedWorkId,
        userId: userId
      })
      toast.success("Đã phân công nhân sự")
      setIsAssignUserDialogOpen(false)
      onRefresh(plan)
    } catch {
      toast.error("Lỗi khi phân công")
    }
  }

  const handleCreateWork = async () => {
    if (!newWorkType || selectedTrees.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }
    try {
      await apiClient.post("/api/work-items", {
        workTypeId: parseInt(newWorkType),
        planId: plan.id,
        creatorId: user?.id || "",
        treeIds: selectedTrees,
        userIds: selectedUsers,
        startDate: plan.startDate,
        endDate: plan.endDate
      })
      toast.success("Đã thêm công việc")
      setIsCreateWorkDialogOpen(false)
      setSelectedTrees([])
      setSelectedUsers([])
      setNewWorkType("")
      onRefresh(plan)
    } catch {
      toast.error("Lỗi khi thêm công việc")
    }
  }

  const handleDeleteWork = (workId: number) => {
    setWorkToDelete(workId)
    setIsDeleteWorkConfirmOpen(true)
  }

  const executeDeleteWork = async () => {
    if (!workToDelete) return
    setIsDeleteWorkConfirmOpen(false)
    try {
      await apiClient.delete(`/api/work-items/${workToDelete}`)
      toast.success("Đã xóa công việc")
      onRefresh(plan)
    } catch {
      toast.error("Không thể xóa công việc")
    } finally {
      setWorkToDelete(null)
    }
  }

  const handleSubmit = async (id: number) => {
    try {
      await apiClient.put(`/api/Planning/${id}/submit`, {})
      toast.success("Thành công", { description: "Đã gửi kế hoạch chờ duyệt." })
      onOpenChange(false)
      onPlansRefresh()
    } catch {
      toast.error("Lỗi", { description: "Không thể gửi duyệt kế hoạch này." })
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await apiClient.put(`/api/Planning/${id}/approve`, {
        id,
        approverId: user?.id || ""
      })
      toast.success("Thành công", { description: "Kế hoạch đã được phê duyệt." })
      onOpenChange(false)
      onPlansRefresh()
    } catch {
      toast.error("Lỗi", { description: "Không thể phê duyệt kế hoạch này." })
    }
  }

  const handleReject = () => {
    setReasonAction("reject")
    setIsReasonDialogOpen(true)
  }

  const handleRequestRevision = () => {
    setReasonAction("revision")
    setIsReasonDialogOpen(true)
  }

  const handleReasonSubmit = async () => {
    if (!reasonText) {
      toast.error("Vui lòng nhập lý do")
      return
    }
    const id = plan.id
    try {
      if (reasonAction === "reject") {
        await apiClient.put(`/api/Planning/${id}/reject`, { id, reason: reasonText })
        toast.success("Đã từ chối kế hoạch")
      } else {
        await apiClient.put(`/api/Planning/${id}/request-revision`, { id, reason: reasonText })
        toast.success("Đã yêu cầu chỉnh sửa")
      }
      setIsReasonDialogOpen(false)
      onOpenChange(false)
      setReasonText("")
      onPlansRefresh()
    } catch {
      toast.error("Thao tác thất bại")
    }
  }

  if (!plan) return null

  return (
    <>
      {/* Delete Work Confirm */}
      <AlertDialog open={isDeleteWorkConfirmOpen} onOpenChange={setIsDeleteWorkConfirmOpen}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl glass">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">Xác nhận xóa công việc</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500">
              Bạn có chắc chắn muốn xóa đầu việc này khỏi kế hoạch? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeleteWork}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-black shadow-lg shadow-destructive/20"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Sheet */}
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-l-[3rem]">
          <div className="h-full flex flex-col">
            <div className="bg-primary p-8 text-white relative">
              <FileText className="absolute top-8 right-8 size-24 opacity-10 rotate-12" />
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full px-3 py-1 font-bold">
                    #{plan.id}
                  </Badge>
                  <StatusBadge status={plan.status} />
                </div>
                <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
                  {plan.name}
                </SheetTitle>
                <SheetDescription className="text-blue-100 font-medium">
                  Cấu trúc và lộ trình triển khai kế hoạch bảo trì.
                </SheetDescription>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">
              {/* Timeline Card */}
              <Card className="p-6 rounded-3xl border-none shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bắt đầu</span>
                    <p className="text-sm font-bold text-slate-700">{new Date(plan.startDate).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div className="h-px flex-1 bg-slate-100 mx-4 relative">
                    <div className="absolute -top-1 right-0 size-2 rounded-full bg-primary" />
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kết thúc</span>
                    <p className="text-sm font-bold text-slate-700">{new Date(plan.endDate).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
              </Card>

              {/* Work Item List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Danh sách công việc</h4>
                    <span className="text-[10px] text-slate-400 font-medium">Chi tiết đầu việc và phân công</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="ghost" className="text-xs font-bold text-primary">
                      {plan.works?.length || 0} ĐẦU VIỆC
                    </Badge>
                    {canEdit && (
                      <Button
                        size="sm"
                        className="h-7 px-2 rounded-lg bg-primary hover:bg-blue-700 text-[9px] font-black"
                        onClick={() => setIsCreateWorkDialogOpen(true)}
                      >
                        <Plus className="size-3 mr-1" /> THÊM VIỆC
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {plan.loading ? (
                    <div className="py-10 text-center">
                      <Loader2 className="size-6 animate-spin mx-auto text-blue-400 mb-2" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Đang tải chi tiết...</p>
                    </div>
                  ) : plan.works && plan.works.length > 0 ? (
                    plan.works.map((work: any) => (
                      <div key={work.id} className="bg-white p-5 rounded-2xl flex flex-col gap-3 border border-slate-50 hover:border-blue-100 transition-all shadow-sm group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                              <TreePine className="size-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-700 leading-none mb-1">{work.workTypeName || "Bảo trì cây"}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                <Calendar className="size-3" />
                                {new Date(work.startDate).toLocaleDateString("vi-VN")} - {new Date(work.endDate).toLocaleDateString("vi-VN")}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={work.status} />
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteWork(work.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                              <TreePine className="size-2.5" /> Đối tượng ({work.treeNames?.length || 0})
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 line-clamp-1">
                              {work.treeNames?.join(", ") || "Chưa gán cây"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                              <User className="size-2.5" /> Phân công
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold text-primary line-clamp-1">
                                {work.assignedUserNames?.join(", ") || "Chưa phân công"}
                              </p>
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-5 rounded-md text-blue-400 hover:bg-blue-50"
                                  onClick={() => {
                                    setSelectedWorkId(work.id);
                                    setIsAssignUserDialogOpen(true);
                                  }}
                                >
                                  <UserPlus className="size-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white/50 p-8 rounded-2xl text-center border border-dashed border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Kế hoạch chưa có đầu việc</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin & Manager Actions */}
              <div className="pt-6">
                {user?.role === ROLES.DoiTruong && (plan.status === "Draft" || plan.status === "NeedsRevision") && (
                  <Button
                    className="w-full bg-primary hover:bg-blue-700 h-14 rounded-2xl font-black gap-2 shadow-xl shadow-primary/20"
                    onClick={() => handleSubmit(plan.id)}
                  >
                    <FileText className="size-5" /> GỬI DUYỆT CHIẾN LƯỢC
                  </Button>
                )}

                {user?.role === ROLES.GiamDoc && plan.status === "PendingApproval" && (
                  <div className="space-y-4">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 h-14 rounded-2xl font-black gap-2 shadow-xl shadow-green-600/20"
                      onClick={() => handleApprove(plan.id)}
                    >
                      <ShieldCheck className="size-5" /> PHÊ DUYỆT KẾ HOẠCH
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="h-12 rounded-2xl font-bold border-orange-200 text-orange-600 hover:bg-orange-50"
                        onClick={handleRequestRevision}
                      >
                        CẦN CHỈNH SỬA
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 rounded-2xl font-bold border-red-200 text-red-600 hover:bg-red-50"
                        onClick={handleReject}
                      >
                        TỪ CHỐI
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Work Dialog */}
      <Dialog open={isCreateWorkDialogOpen} onOpenChange={setIsCreateWorkDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Thêm Đầu việc</DialogTitle>
              <DialogDescription className="text-blue-100">Giao nhiệm vụ cụ thể cho các đối tượng cây xanh.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Loại công việc</Label>
              <Select value={newWorkType} onValueChange={setNewWorkType}>
                <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold">
                  <SelectValue placeholder="Chọn loại công việc..." />
                </SelectTrigger>
                <SelectContent>
                  {workTypes.map((t: any) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Đối tượng cây xanh</Label>
              <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-2 space-y-1 bg-slate-50">
                {availableTrees.map((tree: any) => (
                  <label key={tree.id} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-blue-500"
                      checked={selectedTrees.includes(tree.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTrees([...selectedTrees, tree.id])
                        else setSelectedTrees(selectedTrees.filter(id => id !== tree.id))
                      }}
                    />
                    <span className="text-xs font-bold text-slate-600">{tree.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-1 italic">Đã chọn {selectedTrees.length} cây.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Phân công nhân sự</Label>
              <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-2 space-y-1 bg-slate-50">
                {staffList.map((staff: any) => (
                  <label key={staff.id} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-blue-500"
                      checked={selectedUsers.includes(staff.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedUsers([...selectedUsers, staff.id])
                        else setSelectedUsers(selectedUsers.filter(id => id !== staff.id))
                      }}
                    />
                    <span className="text-xs font-bold text-slate-600">{staff.fullName || staff.userName}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-1 italic">Đã chọn {selectedUsers.length} nhân viên.</p>
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button variant="ghost" onClick={() => setIsCreateWorkDialogOpen(false)} className="rounded-xl font-bold text-slate-400">Hủy</Button>
            <Button
              onClick={handleCreateWork}
              disabled={!newWorkType || selectedTrees.length === 0}
              className="h-12 px-8 rounded-xl bg-primary hover:bg-blue-700 font-black shadow-lg shadow-primary/20"
            >
              Thêm ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={isAssignUserDialogOpen} onOpenChange={setIsAssignUserDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Phân công Nhân sự</DialogTitle>
              <DialogDescription className="text-blue-100 italic">Chọn nhân viên thực hiện đầu việc này.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto space-y-2 bg-slate-50">
            {staffList.length > 0 ? staffList.map((staff: any) => (
              <div
                key={staff.id}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-300 transition-all cursor-pointer group"
                onClick={() => handleAssignUser(staff.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                    {staff.fullName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">{staff.fullName || staff.userName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{staff.email}</p>
                  </div>
                </div>
                <Plus className="size-4 text-slate-200 group-hover:text-primary transition-colors" />
              </div>
            )) : (
              <div className="py-10 text-center text-slate-400 italic text-xs">Không tìm thấy nhân viên khả dụng.</div>
            )}
          </div>
          <DialogFooter className="p-4 bg-white">
            <Button variant="ghost" onClick={() => setIsAssignUserDialogOpen(false)} className="w-full rounded-xl font-bold text-slate-400">Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reason Dialog */}
      <Dialog open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-orange-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">
                {reasonAction === "reject" ? "Từ chối Kế hoạch" : "Yêu cầu Chỉnh sửa"}
              </DialogTitle>
              <DialogDescription className="text-orange-100 italic">Vui lòng cho biết lý do để đội trưởng hoàn thiện lại.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4 bg-white">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Lý do cụ thể</Label>
              <textarea
                className="w-full h-32 p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm text-slate-700 resize-none outline-none"
                placeholder="Nhập nội dung phản hồi tại đây..."
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 bg-white">
            <Button variant="ghost" onClick={() => setIsReasonDialogOpen(false)} className="rounded-xl font-bold text-slate-400">Hủy</Button>
            <Button
              onClick={handleReasonSubmit}
              className="h-12 px-8 rounded-xl bg-orange-600 hover:bg-orange-700 font-black shadow-lg shadow-orange-600/20 text-white"
            >
              Gửi phản hồi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
