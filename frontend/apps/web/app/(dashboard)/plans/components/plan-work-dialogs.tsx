"use client"

import * as React from "react"
import {
  Plus,
  Trash2,
  UserPlus,
  TreePine,
  Calendar,
  User,
  FileText,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanDto {
  id: number
  name: string
  creatorId: string
  creatorName: string
  startDate: string
  endDate: string
  status: string
  workCount?: number
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
    <Badge
      variant="outline"
      className={cn(
        "rounded-lg border-none px-2 py-0.5 text-[9px] font-black shadow-sm",
        styles[status]
      )}
    >
      {labels[status] || status.toUpperCase()}
    </Badge>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PlanWorkSheet({
  plan,
  isOpen,
  onOpenChange,
  onRefresh,
  onPlansRefresh,
}: PlanSheetProps) {
  const { user } = useAuth()

  // Work item management
  const [isCreateWorkDialogOpen, setIsCreateWorkDialogOpen] =
    React.useState(false)
  const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] =
    React.useState(false)
  const [selectedWorkId, setSelectedWorkId] = React.useState<number | null>(
    null
  )
  const [isDeleteWorkConfirmOpen, setIsDeleteWorkConfirmOpen] =
    React.useState(false)
  const [workToDelete, setWorkToDelete] = React.useState<number | null>(null)

  // Lookup data
  const [staffList, setStaffList] = React.useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([])
  const [newWorkType, setNewWorkType] = React.useState("")
  const [selectedTrees, setSelectedTrees] = React.useState<number[]>([])
  const [workTypes, setWorkTypes] = React.useState<any[]>([])
  const [availableTrees, setAvailableTrees] = React.useState<any[]>([])

  const isCaptain = user?.role === ROLES.DoiTruong
  const isDirector = user?.role === ROLES.GiamDoc

  // Reason dialog (reject)
  const [isReasonDialogOpen, setIsReasonDialogOpen] = React.useState(false)
  const [reasonText, setReasonText] = React.useState("")

  React.useEffect(() => {
    if (isOpen) loadLookups()
  }, [isOpen])

  const loadLookups = async () => {
    apiClient
      .get<any[]>("/api/Lookups/work-types")
      .then(setWorkTypes)
      .catch(() => {})
    apiClient
      .get<any>("/api/trees?pageSize=100")
      .then((res) => setAvailableTrees(res.items || []))
      .catch(() => {})
    if (isCaptain) {
      apiClient
        .get<any>("/api/employees")
        .then((res) =>
          setStaffList(
            (res.employees || []).filter((e: any) => e.role === "NhanVien")
          )
        )
        .catch(() => {})
    } else {
      setStaffList([])
    }
  }

  const canEdit =
    isCaptain &&
    (plan?.status === "Draft" ||
      plan?.status === "NeedsRevision" ||
      plan?.status === "PendingApproval")

  const handleAssignUser = async (userId: string) => {
    if (!selectedWorkId) return
    try {
      await apiClient.post(`/api/work-items/${selectedWorkId}/assign-user`, {
        workId: selectedWorkId,
        userId: userId,
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
        endDate: plan.endDate,
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
        approverId: user?.id || "",
      })
      toast.success("Thành công", {
        description: "Kế hoạch đã được phê duyệt.",
      })
      onOpenChange(false)
      onPlansRefresh()
    } catch {
      toast.error("Lỗi", { description: "Không thể phê duyệt kế hoạch này." })
    }
  }

  const handleReject = () => {
    setIsReasonDialogOpen(true)
  }

  const handleReasonSubmit = async () => {
    if (!reasonText) {
      toast.error("Vui lòng nhập lý do")
      return
    }
    const id = plan.id
    try {
      await apiClient.put(`/api/Planning/${id}/reject`, {
        id,
        reason: reasonText,
      })
      toast.success("Đã từ chối kế hoạch")
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
      <AlertDialog
        open={isDeleteWorkConfirmOpen}
        onOpenChange={setIsDeleteWorkConfirmOpen}
      >
        <AlertDialogContent className="glass rounded-[2rem] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">
              Xác nhận xóa công việc
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500">
              Bạn có chắc chắn muốn xóa đầu việc này khỏi kế hoạch? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl border-slate-200 font-bold">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeleteWork}
              className="rounded-xl bg-destructive font-black text-white shadow-lg shadow-destructive/20 hover:bg-destructive/90"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Sheet */}
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-hidden rounded-l-[3rem] border-none p-0 shadow-2xl sm:max-w-xl">
          <div className="flex h-full flex-col">
            <div className="relative bg-primary p-8 text-white">
              <FileText className="absolute top-8 right-8 size-24 rotate-12 opacity-10" />
              <SheetHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Badge className="rounded-full border-none bg-white/20 px-3 py-1 font-bold text-white hover:bg-white/30">
                    #{plan.id}
                  </Badge>
                  <StatusBadge status={plan.status} />
                </div>
                <SheetTitle className="text-2xl font-black tracking-tighter text-white uppercase italic">
                  {plan.name}
                </SheetTitle>
                <SheetDescription className="font-medium text-blue-100">
                  Cấu trúc và lộ trình triển khai kế hoạch bảo trì.
                </SheetDescription>
              </SheetHeader>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto bg-slate-50 p-8">
              {/* Timeline Card */}
              <Card className="space-y-4 rounded-3xl border-none p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Bắt đầu
                    </span>
                    <p className="text-sm font-bold text-slate-700">
                      {new Date(plan.startDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="relative mx-4 h-px flex-1 bg-slate-100">
                    <div className="absolute -top-1 right-0 size-2 rounded-full bg-primary" />
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Kết thúc
                    </span>
                    <p className="text-sm font-bold text-slate-700">
                      {new Date(plan.endDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Work Item List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">
                      Danh sách công việc
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400">
                      Chi tiết đầu việc và phân công
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant="ghost"
                      className="text-xs font-bold text-primary"
                    >
                      {plan.works?.length || 0} ĐẦU VIỆC
                    </Badge>
                    {canEdit && (
                      <Button
                        size="sm"
                        className="h-7 rounded-lg bg-primary px-2 text-[9px] font-black hover:bg-blue-700"
                        onClick={() => setIsCreateWorkDialogOpen(true)}
                      >
                        <Plus className="mr-1 size-3" /> THÊM VIỆC
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {plan.loading ? (
                    <div className="py-10 text-center">
                      <Loader2 className="mx-auto mb-2 size-6 animate-spin text-blue-400" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Đang tải chi tiết...
                      </p>
                    </div>
                  ) : plan.works && plan.works.length > 0 ? (
                    plan.works.map((work: any) => (
                      <div
                        key={work.id}
                        className="group flex flex-col gap-3 rounded-2xl border border-slate-50 bg-white p-5 shadow-sm transition-all hover:border-blue-100"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-primary">
                              <TreePine className="size-5" />
                            </div>
                            <div>
                              <p className="mb-1 text-sm leading-none font-black text-slate-700">
                                {work.workTypeName || "Bảo trì cây"}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] font-bold tracking-tighter text-slate-400 uppercase">
                                <Calendar className="size-3" />
                                {new Date(work.startDate).toLocaleDateString(
                                  "vi-VN"
                                )}{" "}
                                -{" "}
                                {new Date(work.endDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={work.status} />
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDeleteWork(work.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-slate-50 pt-3">
                          <div className="space-y-1">
                            <p className="flex items-center gap-1 text-[9px] font-black tracking-widest text-slate-300 uppercase">
                              <TreePine className="size-2.5" /> Đối tượng (
                              {work.treeNames?.length || 0})
                            </p>
                            <p className="line-clamp-1 text-[10px] font-bold text-slate-500">
                              {work.treeNames?.join(", ") || "Chưa gán cây"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="flex items-center gap-1 text-[9px] font-black tracking-widest text-slate-300 uppercase">
                              <User className="size-2.5" /> Phân công
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="line-clamp-1 text-[10px] font-bold text-primary">
                                {work.assignedUserNames?.join(", ") ||
                                  "Chưa phân công"}
                              </p>
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-5 rounded-md text-blue-400 hover:bg-blue-50"
                                  onClick={() => {
                                    setSelectedWorkId(work.id)
                                    setIsAssignUserDialogOpen(true)
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
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-8 text-center">
                      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase italic">
                        Kế hoạch chưa có đầu việc
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin & Manager Actions */}
              <div className="pt-6">
                {isCaptain &&
                  (plan.status === "Draft" ||
                    plan.status === "NeedsRevision") && (
                    <Button
                      className="h-14 w-full gap-2 rounded-2xl bg-primary font-black shadow-xl shadow-primary/20 hover:bg-blue-700"
                      onClick={() => handleSubmit(plan.id)}
                    >
                      <FileText className="size-5" /> GỬI DUYỆT CHIẾN LƯỢC
                    </Button>
                  )}

                {isDirector && plan.status === "PendingApproval" && (
                  <div className="space-y-4">
                    <Button
                      className="h-14 w-full gap-2 rounded-2xl bg-green-600 font-black shadow-xl shadow-green-600/20 hover:bg-green-700"
                      onClick={() => handleApprove(plan.id)}
                    >
                      <ShieldCheck className="size-5" /> PHÊ DUYỆT KẾ HOẠCH
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 rounded-2xl border-red-200 font-bold text-red-600 hover:bg-red-50"
                      onClick={handleReject}
                    >
                      TỪ CHỐI
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Work Dialog */}
      <Dialog
        open={isCreateWorkDialogOpen}
        onOpenChange={setIsCreateWorkDialogOpen}
      >
        <DialogContent className="overflow-hidden rounded-3xl border-none p-0 shadow-2xl sm:max-w-[425px]">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">
                Thêm Đầu việc
              </DialogTitle>
              <DialogDescription className="text-blue-100">
                Giao nhiệm vụ cụ thể cho các đối tượng cây xanh.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="space-y-4 p-6">
            <div className="space-y-2">
              <Label className="text-xs font-black tracking-widest text-slate-400 uppercase">
                Loại công việc
              </Label>
              <Select value={newWorkType} onValueChange={setNewWorkType}>
                <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold">
                  <SelectValue placeholder="Chọn loại công việc..." />
                </SelectTrigger>
                <SelectContent>
                  {workTypes.map((t: any) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black tracking-widest text-slate-400 uppercase">
                Đối tượng cây xanh
              </Label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2">
                {availableTrees.map((tree: any) => (
                  <label
                    key={tree.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-blue-500"
                      checked={selectedTrees.includes(tree.id)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedTrees([...selectedTrees, tree.id])
                        else
                          setSelectedTrees(
                            selectedTrees.filter((id) => id !== tree.id)
                          )
                      }}
                    />
                    <span className="text-xs font-bold text-slate-600">
                      {tree.name}
                    </span>
                  </label>
                ))}
              </div>
              <p className="px-1 text-[10px] font-medium text-slate-400 italic">
                Đã chọn {selectedTrees.length} cây.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black tracking-widest text-slate-400 uppercase">
                Phân công nhân sự
              </Label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2">
                {staffList.map((staff: any) => (
                  <label
                    key={staff.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-blue-500"
                      checked={selectedUsers.includes(staff.id)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedUsers([...selectedUsers, staff.id])
                        else
                          setSelectedUsers(
                            selectedUsers.filter((id) => id !== staff.id)
                          )
                      }}
                    />
                    <span className="text-xs font-bold text-slate-600">
                      {staff.fullName || staff.userName}
                    </span>
                  </label>
                ))}
              </div>
              <p className="px-1 text-[10px] font-medium text-slate-400 italic">
                Đã chọn {selectedUsers.length} nhân viên.
              </p>
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button
              variant="ghost"
              onClick={() => setIsCreateWorkDialogOpen(false)}
              className="rounded-xl font-bold text-slate-400"
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateWork}
              disabled={!newWorkType || selectedTrees.length === 0}
              className="h-12 rounded-xl bg-primary px-8 font-black shadow-lg shadow-primary/20 hover:bg-blue-700"
            >
              Thêm ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog
        open={isAssignUserDialogOpen}
        onOpenChange={setIsAssignUserDialogOpen}
      >
        <DialogContent className="overflow-hidden rounded-3xl border-none p-0 shadow-2xl sm:max-w-[400px]">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">
                Phân công Nhân sự
              </DialogTitle>
              <DialogDescription className="text-blue-100 italic">
                Chọn nhân viên thực hiện đầu việc này.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto bg-slate-50 p-4">
            {staffList.length > 0 ? (
              staffList.map((staff: any) => (
                <div
                  key={staff.id}
                  className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-blue-300"
                  onClick={() => handleAssignUser(staff.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-400 transition-colors group-hover:bg-primary group-hover:text-white">
                      {staff.fullName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">
                        {staff.fullName || staff.userName}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400">
                        {staff.email}
                      </p>
                    </div>
                  </div>
                  <Plus className="size-4 text-slate-200 transition-colors group-hover:text-primary" />
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-slate-400 italic">
                Không tìm thấy nhân viên khả dụng.
              </div>
            )}
          </div>
          <DialogFooter className="bg-white p-4">
            <Button
              variant="ghost"
              onClick={() => setIsAssignUserDialogOpen(false)}
              className="w-full rounded-xl font-bold text-slate-400"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reason Dialog */}
      <Dialog open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
        <DialogContent className="overflow-hidden rounded-3xl border-none p-0 shadow-2xl sm:max-w-[400px]">
          <div className="bg-orange-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">
                Từ chối Kế hoạch
              </DialogTitle>
              <DialogDescription className="text-orange-100 italic">
                Vui lòng cho biết lý do để đội trưởng hoàn thiện lại.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="space-y-4 bg-white p-6">
            <div className="space-y-2">
              <Label className="text-xs font-black tracking-widest text-slate-400 uppercase">
                Lý do cụ thể
              </Label>
              <textarea
                className="h-32 w-full resize-none rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-700 transition-all outline-none focus:border-orange-500 focus:bg-white focus:ring-orange-500/20"
                placeholder="Nhập nội dung phản hồi tại đây..."
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="bg-white p-6 pt-0">
            <Button
              variant="ghost"
              onClick={() => setIsReasonDialogOpen(false)}
              className="rounded-xl font-bold text-slate-400"
            >
              Hủy
            </Button>
            <Button
              onClick={handleReasonSubmit}
              className="h-12 rounded-xl bg-orange-600 px-8 font-black text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700"
            >
              Gửi phản hồi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
