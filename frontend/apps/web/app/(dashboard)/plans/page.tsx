"use client"

import * as React from "react"
import { 
  ClipboardList, Plus, Sparkles, SearchIcon, FilterIcon,
  Loader2, Calendar, User, CheckCircle2, Clock, 
  ChevronRight, ChevronLeft, ShieldCheck, ShieldAlert,
  TreePine, FileText, ArrowRight, ExternalLink,
  Trash2, UserPlus, Info, CheckCircle, AlertTriangle, RotateCcw
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@workspace/ui/components/sheet"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"
import { AutoPlanDialog } from "./components/auto-plan-dialog"

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

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@workspace/ui/components/select"

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
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

export default function PlansPage() {
  const { user } = useAuth()
  const isAdmin = user && (user.role === ROLES.DoiTruong || user.role === ROLES.GiamDoc);

  const [plans, setPlans] = React.useState<PlanDto[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(8)
  
  // Detail & Dialog states
  const [selectedPlan, setSelectedPlan] = React.useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isAutoDialogOpen, setIsAutoDialogOpen] = React.useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [newPlanDates, setNewPlanDates] = React.useState({ start: "", end: "" })
  const [isFullCreateMode, setIsFullCreateMode] = React.useState(false)
  const [initialWorkItems, setInitialWorkItems] = React.useState<any[]>([])

  const [newPlanName, setNewPlanName] = React.useState("")

  // Work Item Management States
  const [isCreateWorkDialogOpen, setIsCreateWorkDialogOpen] = React.useState(false)
  const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] = React.useState(false)
  const [selectedWorkId, setSelectedWorkId] = React.useState<number | null>(null)
  
  const [isDeleteWorkConfirmOpen, setIsDeleteWorkConfirmOpen] = React.useState(false)
  const [workToDelete, setWorkToDelete] = React.useState<number | null>(null)

  const [staffList, setStaffList] = React.useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([])
  const [newWorkType, setNewWorkType] = React.useState("")
  const [selectedTrees, setSelectedTrees] = React.useState<number[]>([])
  const [workTypes, setWorkTypes] = React.useState<any[]>([])
  const [availableTrees, setAvailableTrees] = React.useState<any[]>([])

  // Fetch lookup data
  const loadLookups = async () => {
    // Load Work Types
    apiClient.get<any[]>("/api/Lookups/work-types")
      .then(setWorkTypes)
      .catch(err => console.error("Load work types error:", err));

    // Load Trees
    apiClient.get<any>("/api/trees?pageSize=100")
      .then(res => setAvailableTrees(res.items || []))
      .catch(err => console.error("Load trees error:", err));

    // Load Employees
    apiClient.get<any>("/api/employees")
      .then(res => setStaffList((res.employees || []).filter((e: any) => e.role === "NhanVien")))
      .catch(err => console.error("Load staff error:", err));
  }

  const handleAssignUser = async (userId: string) => {
    if (!selectedWorkId) return
    try {
        await apiClient.post(`/api/work-items/${selectedWorkId}/assign-user`, {
            workId: selectedWorkId,
            userId: userId
        })
        toast.success("Đã phân công nhân sự")
        setIsAssignUserDialogOpen(false)
        handleRowClick(selectedPlan)
    } catch (err) {
        toast.error("Lỗi khi phân công")
    }
  }

  const loadPlans = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<PlanDto[]>("/api/Planning")
      setPlans(data || [])
    } catch (err) {
      console.error("Load plans error:", err)
      toast.error("Lỗi", { description: "Không thể tải danh sách kế hoạch." })
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = async (plan: PlanDto) => {
    setIsSheetOpen(true)
    setSelectedPlan({ ...plan, loading: true })
    try {
      const detail = await apiClient.get<any>(`/api/Planning/${plan.id}`)
      setSelectedPlan(detail)
    } catch (err) {
      toast.error("Lỗi", { description: "Không thể tải chi tiết kế hoạch." })
      setSelectedPlan(plan)
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
            planId: selectedPlan.id,
            creatorId: user?.id || "",
            treeIds: selectedTrees,
            userIds: selectedUsers,
            startDate: selectedPlan.startDate,
            endDate: selectedPlan.endDate
        })
        toast.success("Đã thêm công việc")
        setIsCreateWorkDialogOpen(false)
        setSelectedTrees([])
        setSelectedUsers([])
        setNewWorkType("")
        handleRowClick(selectedPlan)
    } catch (err) {
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
        handleRowClick(selectedPlan)
    } catch (err) {
        toast.error("Không thể xóa công việc")
    } finally {
        setWorkToDelete(null)
    }
  }

  React.useEffect(() => {
    loadPlans()
  }, [])

  React.useEffect(() => {
    if (isSheetOpen) loadLookups()
  }, [isSheetOpen])

  const handleCreatePlan = async () => {
    if (!newPlanName) {
      toast.error("Vui lòng nhập tên kế hoạch")
      return
    }
    try {
      await apiClient.post("/api/Planning", {
        name: newPlanName,
        creatorId: user?.id || localStorage.getItem("user_id") || "",
        startDate: newPlanDates.start ? new Date(newPlanDates.start).toISOString() : new Date().toISOString(),
        endDate: newPlanDates.end ? new Date(newPlanDates.end).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        workItems: initialWorkItems.length > 0 ? initialWorkItems : null
      })
      toast.success("Thành công", { description: "Đã tạo kế hoạch mới." })
      setIsCreateDialogOpen(false)
      setNewPlanName("")
      setNewPlanDates({ start: "", end: "" })
      setInitialWorkItems([])
      loadPlans()
    } catch (err: any) {
      toast.error("Lỗi tạo kế hoạch", { 
        description: err.message || "Vui lòng kiểm tra lại thông tin." 
      })
    }
  }

  const handleAddInitialWork = () => {
    setInitialWorkItems([...initialWorkItems, { workTypeId: 1, treeIds: [], userIds: [], content: "" }])
  }

  const handleSubmit = async (id: number) => {
    try {
      await apiClient.put(`/api/Planning/${id}/submit`, {})
      toast.success("Thành công", { description: "Đã gửi kế hoạch chờ duyệt." })
      setIsSheetOpen(false)
      loadPlans()
    } catch (err) {
      toast.error("Lỗi", { description: "Không thể gửi duyệt kế hoạch này." })
    }
  }

  // Approval management
  const [isReasonDialogOpen, setIsReasonDialogOpen] = React.useState(false)
  const [reasonAction, setReasonAction] = React.useState<"reject" | "revision" | null>(null)
  const [reasonText, setReasonText] = React.useState("")

  const handleApprove = async (id: number) => {
    try {
      await apiClient.put(`/api/Planning/${id}/approve`, {
        id,
        approverId: user?.id || ""
      })
      toast.success("Thành công", { description: "Kế hoạch đã được phê duyệt." })
      setIsSheetOpen(false)
      loadPlans()
    } catch (err) {
      toast.error("Lỗi", { description: "Không thể phê duyệt kế hoạch này." })
    }
  }

  const handleReasonSubmit = async () => {
    if (!reasonText) {
        toast.error("Vui lòng nhập lý do")
        return
    }
    const id = selectedPlan.id
    try {
        if (reasonAction === "reject") {
            await apiClient.put(`/api/Planning/${id}/reject`, { id, reason: reasonText })
            toast.success("Đã từ chối kế hoạch")
        } else {
            await apiClient.put(`/api/Planning/${id}/request-revision`, { id, reason: reasonText })
            toast.success("Đã yêu cầu chỉnh sửa")
        }
        setIsReasonDialogOpen(false)
        setIsSheetOpen(false)
        setReasonText("")
        loadPlans()
    } catch (err) {
        toast.error("Thao tác thất bại")
    }
  }

  const handleReject = async (id: number) => {
    setReasonAction("reject")
    setIsReasonDialogOpen(true)
  }

  const handleRequestRevision = async (id: number) => {
    setReasonAction("revision")
    setIsReasonDialogOpen(true)
  }

  const filteredPlans = plans.filter(p => 
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedPlans = filteredPlans.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filteredPlans.length / pageSize)

  return (
    <div className="p-6 space-y-6">
      {/* AlertDialog for Delete Work */}
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kế hoạch Chiến lược</h1>
          <p className="text-sm text-slate-500 font-medium italic">Xây dựng lộ trình bảo trì và chăm sóc cây xanh toàn thành phố.</p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3">
             <Button 
                variant="outline"
                onClick={() => setIsAutoDialogOpen(true)}
                className="h-11 px-6 rounded-2xl border-primary/20 text-primary font-bold gap-2 hover:bg-primary/5 transition-all"
             >
                <Sparkles className="size-4" /> AI GỢI Ý
             </Button>
             <Button 
                className="h-11 px-6 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold gap-2 transition-all hover:scale-105"
                onClick={() => setIsCreateDialogOpen(true)}
             >
                <Plus className="size-4" /> TẠO MỚI
             </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard icon={ClipboardList} label="Kế hoạch đang chạy" value="5" color="primary" />
        <StatsCard icon={Clock} label="Chờ phê duyệt" value="2" color="orange" />
        <StatsCard icon={CheckCircle2} label="Đã hoàn thành" value="48" color="green" />
        </div>


      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Lộ trình vận hành ({filteredPlans.length})</h3>
          <div className="relative w-full md:w-96">
            <SearchIcon className="absolute left-3.5 top-3 size-4 text-slate-400" />
            <Input 
              className="pl-11 h-11 text-xs rounded-xl border-none bg-slate-100/50 focus-visible:ring-primary" 
              placeholder="Tìm kiếm tên kế hoạch..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-y divide-slate-50 border-t border-slate-50">
           {loading ? (
             <div className="col-span-4 py-20 text-center">
                <Loader2 className="size-10 animate-spin mx-auto text-primary mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang tải chiến lược...</p>
             </div>
           ) : paginatedPlans.length > 0 ? (
             paginatedPlans.map(plan => (
               <div 
                  key={plan.id} 
                  className="p-6 hover:bg-primary/5 transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => handleRowClick(plan)}
                >
                  <div className="absolute -right-4 -bottom-4 size-24 bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700" />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-white border-slate-200 text-slate-500">
                            #{plan.id}
                        </Badge>
                        <StatusBadge status={plan.status} />
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {plan.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2 text-slate-400">
                            <User className="size-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{plan.creatorName || "Hệ thống"}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-300 uppercase">Thời hạn</span>
                            <span className="text-[11px] font-bold text-slate-600">
                                {new Date(plan.startDate).toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                        <ArrowRight className="size-4 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
               </div>
             ))
           ) : (
             <div className="col-span-4 py-20 text-center text-slate-400 italic font-medium">
                Không tìm thấy kế hoạch nào.
             </div>
           )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Trang {page} / {totalPages}
                </p>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg"
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
          {selectedPlan && (
            <div className="h-full flex flex-col">
              <div className="bg-primary p-8 text-white relative">
                <FileText className="absolute top-8 right-8 size-24 opacity-10 rotate-12" />
                <SheetHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full px-3 py-1 font-bold">
                            #{selectedPlan.id}
                        </Badge>
                        <StatusBadge status={selectedPlan.status} />
                    </div>
                    <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
                        {selectedPlan.name}
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
                            <p className="text-sm font-bold text-slate-700">{new Date(selectedPlan.startDate).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <div className="h-px flex-1 bg-slate-100 mx-4 relative">
                            <div className="absolute -top-1 right-0 size-2 rounded-full bg-primary" />
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kết thúc</span>
                            <p className="text-sm font-bold text-slate-700">{new Date(selectedPlan.endDate).toLocaleDateString("vi-VN")}</p>
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
                                {selectedPlan.works?.length || 0} ĐẦU VIỆC
                           </Badge>
                           {(user?.role === ROLES.DoiTruong || user?.role === ROLES.GiamDoc) && (selectedPlan.status === "Draft" || selectedPlan.status === "NeedsRevision" || selectedPlan.status === "PendingApproval") && (
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
                        {selectedPlan.loading ? (
                             <div className="py-10 text-center">
                                <Loader2 className="size-6 animate-spin mx-auto text-blue-400 mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Đang tải chi tiết...</p>
                             </div>
                        ) : selectedPlan.works && selectedPlan.works.length > 0 ? (
                            selectedPlan.works.map((work: any) => (
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
                                            {(user?.role === ROLES.DoiTruong || user?.role === ROLES.GiamDoc) && (selectedPlan.status === "Draft" || selectedPlan.status === "NeedsRevision" || selectedPlan.status === "PendingApproval") && (
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
                                                {(user?.role === ROLES.DoiTruong || user?.role === ROLES.GiamDoc) && (selectedPlan.status === "Draft" || selectedPlan.status === "NeedsRevision" || selectedPlan.status === "PendingApproval") && (
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
                    {/* Đội trưởng gửi duyệt */}
                    {user?.role === ROLES.DoiTruong && (selectedPlan.status === "Draft" || selectedPlan.status === "NeedsRevision") && (
                        <Button 
                            className="w-full bg-primary hover:bg-blue-700 h-14 rounded-2xl font-black gap-2 shadow-xl shadow-primary/20"
                            onClick={() => handleSubmit(selectedPlan.id)}
                        >
                            <FileText className="size-5" /> GỬI DUYỆT CHIẾN LƯỢC
                        </Button>
                    )}

                    {/* Giám đốc phê duyệt/từ chối */}
                    {user?.role === ROLES.GiamDoc && selectedPlan.status === "PendingApproval" && (
                        <div className="space-y-4">
                            <Button 
                                className="w-full bg-green-600 hover:bg-green-700 h-14 rounded-2xl font-black gap-2 shadow-xl shadow-green-600/20"
                                onClick={() => handleApprove(selectedPlan.id)}
                            >
                                <ShieldCheck className="size-5" /> PHÊ DUYỆT KẾ HOẠCH
                            </Button>
                            <div className="grid grid-cols-2 gap-4">
                                <Button 
                                    variant="outline" 
                                    className="h-12 rounded-2xl font-bold border-orange-200 text-orange-600 hover:bg-orange-50"
                                    onClick={() => handleRequestRevision(selectedPlan.id)}
                                >
                                    CẦN CHỈNH SỬA
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-12 rounded-2xl font-bold border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => handleReject(selectedPlan.id)}
                                >
                                    TỪ CHỐI
                                </Button>
                            </div>
                        </div>
                    )}
                 </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AutoPlanDialog 
        open={isAutoDialogOpen} 
        onOpenChange={setIsAutoDialogOpen}
        onSuccess={loadPlans}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-primary p-8 text-white relative">
                <ClipboardList className="absolute top-6 right-6 size-16 opacity-10 rotate-12" />
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Lập Kế hoạch Chiến lược</DialogTitle>
                    <DialogDescription className="text-blue-100 font-medium italic">Thiết lập lộ trình bảo trì và chăm sóc cây xanh toàn diện.</DialogDescription>
                </DialogHeader>
            </div>
            <div className="p-8 space-y-6 bg-slate-50/50 backdrop-blur-xl">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tiêu đề kế hoạch</Label>
                    <Input 
                        placeholder="VD: Bảo trì công viên 29/3 - Giai đoạn 1"
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                        className="h-14 rounded-2xl border-slate-200 bg-white focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold px-5 text-slate-700 shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Ngày bắt đầu</Label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-4 size-4 text-slate-300 pointer-events-none" />
                            <Input 
                                type="date"
                                value={newPlanDates.start}
                                onChange={(e) => setNewPlanDates({...newPlanDates, start: e.target.value})}
                                className="h-12 rounded-xl border-slate-100 bg-white pl-11 font-bold text-slate-600"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Ngày kết thúc</Label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-4 size-4 text-slate-300 pointer-events-none" />
                            <Input 
                                type="date"
                                value={newPlanDates.end}
                                onChange={(e) => setNewPlanDates({...newPlanDates, end: e.target.value})}
                                className="h-12 rounded-xl border-slate-100 bg-white pl-11 font-bold text-slate-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Phần thêm nhanh công việc (Nếu muốn) */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danh sách hạng mục ({initialWorkItems.length})</h4>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 rounded-lg text-primary font-black text-[9px] hover:bg-blue-50"
                            onClick={handleAddInitialWork}
                        >
                            <Plus className="size-3 mr-1" /> THÊM HẠNG MỤC
                        </Button>
                    </div>

                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {initialWorkItems.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 relative group">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-2 right-2 size-6 rounded-full opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
                                    onClick={() => setInitialWorkItems(initialWorkItems.filter((_, i) => i !== idx))}
                                >
                                    <Trash2 className="size-3" />
                                </Button>
                                
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase text-slate-300">Loại công việc</Label>
                                    <Select 
                                        value={item.workTypeId.toString()} 
                                        onValueChange={(val) => {
                                            const newItems = [...initialWorkItems];
                                            newItems[idx].workTypeId = parseInt(val);
                                            setInitialWorkItems(newItems);
                                        }}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl border-slate-100 bg-slate-50 text-xs font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workTypes.map((t: any) => (
                                                <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                        {initialWorkItems.length === 0 && (
                            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-300 uppercase italic">Chưa có hạng mục đi kèm</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <DialogFooter className="p-8 pt-0 bg-slate-50/50">
                <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="h-14 rounded-2xl font-bold text-slate-400 flex-1 hover:bg-slate-100">Hủy</Button>
                <Button 
                    onClick={handleCreatePlan}
                    className="h-14 px-8 rounded-2xl bg-primary hover:bg-blue-700 font-black shadow-xl shadow-primary/30 flex-1 gap-2"
                >
                    <ShieldCheck className="size-5" /> KÍCH HOẠT CHIẾN LƯỢC
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
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
    </div>
  )
}

function StatsCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  const colors: any = {
    green: "bg-green-500/10 text-green-600 ring-green-500/20",
    orange: "bg-orange-500/10 text-orange-600 ring-orange-500/20",
    primary: "bg-primary text-white shadow-primary/20"
  }
  return (
    <Card className={cn(
        "p-6 flex items-center gap-5 hover:scale-[1.03] transition-all duration-300 cursor-default group border-none shadow-lg shadow-slate-200/50 rounded-3xl bg-white",
        color === "primary" && "bg-primary"
    )}>
      <div className={cn(
          "size-14 rounded-2xl flex items-center justify-center ring-1 shadow-inner group-hover:scale-110 transition-transform duration-500", 
          colors[color],
          color === "primary" && "bg-white/20 ring-white/10 text-white"
      )}>
        <Icon className="size-7" />
      </div>
      <div>
        <p className={cn("text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", color === "primary" && "text-primary-foreground/70")}>{label}</p>
        <p className={cn("text-3xl font-black text-slate-800 tracking-tighter", color === "primary" && "text-white")}>{value}</p>
      </div>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Draft: "bg-slate-100 text-slate-600",
    PendingApproval: "bg-primary/10 text-primary",
    NeedsRevision: "bg-orange-100 text-orange-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    InProgress: "bg-primary text-white",
    Completed: "bg-slate-500 text-white",
  }
  const labels: any = {
    Draft: "BẢN NHÁP",
    PendingApproval: "CHỜ DUYỆT",
    NeedsRevision: "CẦN SỬA",
    Approved: "ĐÃ DUYỆT",
    Rejected: "BỊ TỪ CHỐI",
    InProgress: "ĐANG CHẠY",
    Completed: "HOÀN THÀNH"
  }
  return (
    <Badge variant="outline" className={cn("text-[9px] font-black px-2 py-0.5 rounded-lg border-none shadow-sm", styles[status])}>
      {labels[status] || status.toUpperCase()}
    </Badge>
  )
}
