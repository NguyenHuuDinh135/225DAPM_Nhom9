"use client"

import * as React from "react"
import { 
  TriangleAlertIcon, AlertOctagonIcon, CheckCircle2Icon, 
  ClockIcon, SearchIcon, ChevronRightIcon, FilterIcon,
  Loader2, MapPin, Calendar, User, MessageSquare,
  ShieldCheck, ShieldAlert, ImageIcon, X, ChevronLeft, ChevronRight
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@workspace/ui/components/select"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@workspace/ui/components/sheet"
import { apiClient, getImageUrl } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

interface IncidentDto {
  id: number;
  description: string;
  severity: string;
  status: string;
  reportedDate: string;
  treeId: number;
  treeName: string;
  reporterName: string;
  images?: string[];
}

export default function IncidentsPage() {
  const { user } = useAuth()
  const isAdmin = user && (user.role === ROLES.DoiTruong || user.role === ROLES.GiamDoc);

  const [incidents, setIncidents] = React.useState<IncidentDto[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [totalCount, setTotalCount] = React.useState(0)
  
  // Detail view state
  const [selectedIncident, setSelectedIncident] = React.useState<IncidentDto | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [teams, setTeams] = React.useState<any[]>([])
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>("")
  const [rejectReason, setRejectReason] = React.useState("")

  const loadIncidents = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<any>("/api/tree-incidents")
      // Backend returns TreeIncidentsVm { treeIncidents: [...] }
      let items = data?.treeIncidents || data?.incidents || data?.items || (Array.isArray(data) ? data : [])
      
      // FALLBACK: Nếu thực sự không có dữ liệu (kể cả sau khi map đúng trường), dùng mock data
      if (items.length === 0) {
        items = [
          {
            id: 101,
            description: "Cây lim sẹt lớn tại ngã tư bị gãy cành sau trận mưa đêm qua, gây cản trở giao thông.",
            severity: "High",
            status: "Pending",
            reportedDate: new Date().toISOString(),
            treeId: 42,
            treeName: "Lim Sẹt #042",
            reporterName: "Nguyễn Văn An",
            images: []
          },
          {
            id: 102,
            description: "Cây xà cừ có dấu hiệu bị sâu đục thân nặng, cần xử lý thuốc bảo vệ thực vật.",
            severity: "Medium",
            status: "InProgress",
            reportedDate: new Date(Date.now() - 86400000).toISOString(),
            treeId: 15,
            treeName: "Xà Cừ #015",
            reporterName: "Phạm Thị Bình",
            images: []
          },
          {
            id: 103,
            description: "Rễ cây phượng vĩ làm nứt vỡ vỉa hè, gây nguy hiểm cho người đi bộ.",
            severity: "Low",
            status: "Resolved",
            reportedDate: new Date(Date.now() - 172800000).toISOString(),
            treeId: 89,
            treeName: "Phượng Vĩ #089",
            reporterName: "Lê Văn Cường",
            images: []
          }
        ]
        toast.info("Chế độ trình diễn", { description: "Đang hiển thị dữ liệu sự cố mẫu do cơ sở dữ liệu trống." })
      }

      setIncidents(items)
      setTotalCount(items.length)
      
      const employeeRes = await apiClient.get<any>("/api/employees")
      const allEmployees = employeeRes?.employees || []
      setTeams(allEmployees.filter((e: any) => e.role === "DoiTruong").map((e: any) => ({
          id: e.id,
          name: e.fullName || e.userName
      })))
    } catch (err: any) {
      console.error("Load incidents error:", err)
      setIncidents([])
      toast.error("Lỗi", { description: "Không thể tải danh sách sự cố từ máy chủ." })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadIncidents()
  }, [])

  const handleRowClick = (incident: IncidentDto) => {
    setSelectedIncident(incident)
    setIsSheetOpen(true)
    setSelectedTeamId("")
    setRejectReason("")
  }

  const handleApprove = async (id: number) => {
    try {
      await apiClient.put(`/api/tree-incidents/${id}/approve`, {
        id,
        approverId: user?.id || "",
        teamId: selectedTeamId || null
      })
      toast.success("Thành công", { description: "Đã duyệt sự cố và điều phối." })
      setIsSheetOpen(false)
      loadIncidents()
    } catch (err: any) {
      toast.error("Lỗi", { description: err.message || "Không thể duyệt sự cố này." })
    }
  }

  const handleReject = async (id: number) => {
    if (!rejectReason) {
        toast.error("Vui lòng nhập lý do từ chối");
        return;
    }
    try {
        // 1. Cập nhật trạng thái sự cố sang Rejected
        await apiClient.put(`/api/tree-incidents/${id}/status`, {
            id,
            status: "Rejected"
        });
        
        // 2. Gửi phản hồi (Feedback) đúng định dạng Backend
        await apiClient.post(`/api/tree-incidents/${id}/feedback`, {
            incidentId: id,
            feedback: `Sự cố bị từ chối. Lý do: ${rejectReason}`,
            approverId: user?.id || "",
            isResolved: false
        });

        toast.success("Đã từ chối sự cố");
        setIsSheetOpen(false);
        loadIncidents();
    } catch (err) {
        console.error("Reject error:", err);
        toast.error("Thao tác thất bại", { description: "Không thể từ chối sự cố này." });
    }
  }

  const filteredIncidents = (incidents || []).filter(i => 
    !search || 
    i.description.toLowerCase().includes(search.toLowerCase()) || 
    i.treeName.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedIncidents = filteredIncidents.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filteredIncidents.length / pageSize)

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Trung tâm Sự cố</h1>
          <p className="text-sm text-slate-500 font-medium italic">Tiếp nhận, đánh giá và điều phối xử lý sự cố cây xanh.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard icon={AlertOctagonIcon} label="Khẩn cấp" value="3" color="red" />
        <StatusCard icon={TriangleAlertIcon} label="Mới ghi nhận" value="12" color="orange" />
        <StatusCard icon={ClockIcon} label="Đang xử lý" value="8" color="blue" />
        <StatusCard icon={CheckCircle2Icon} label="Đã khắc phục" value="156" color="green" />
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Danh mục sự cố ({filteredIncidents.length})</h3>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <SearchIcon className="absolute left-3.5 top-3 size-4 text-slate-400" />
              <Input 
                className="pl-11 h-11 text-xs rounded-xl border-none bg-slate-100/50 focus-visible:ring-red-500" 
                placeholder="Tìm kiếm nội dung sự cố hoặc tên cây..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Sự cố</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Cây xanh liên quan</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Mức độ</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="size-8 animate-spin mx-auto text-red-600 mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : paginatedIncidents.length > 0 ? (
                paginatedIncidents.map(incident => (
                  <tr 
                    key={incident.id} 
                    className="hover:bg-red-50/30 transition-all cursor-pointer group"
                    onClick={() => handleRowClick(incident)}
                  >
                    <td className="px-6 py-5 max-w-[300px]">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                            <TriangleAlertIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-red-700">{incident.description}</p>
                            <p className="text-[10px] text-slate-400 font-medium italic">Báo cáo lúc: {new Date(incident.reportedDate).toLocaleString("vi-VN")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">#{incident.treeId}</span>
                        <span className="text-xs text-slate-400 font-medium">{incident.treeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <SeverityBadge severity={incident.severity} />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <StatusBadge status={incident.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-white hover:shadow-md">
                        <ChevronRightIcon className="size-4 text-slate-400" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic font-medium">
                    Không có báo cáo sự cố nào được tìm thấy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Control */}
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
          {selectedIncident && (
            <div className="h-full flex flex-col">
              <div className="bg-red-600 p-8 text-white relative">
                <AlertOctagonIcon className="absolute top-8 right-8 size-24 opacity-10 rotate-12" />
                <SheetHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full px-3 py-1 font-bold">
                            #{selectedIncident.id}
                        </Badge>
                        <StatusBadge status={selectedIncident.status} />
                    </div>
                    <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
                        Chi tiết Sự cố
                    </SheetTitle>
                    <SheetDescription className="text-red-100 font-medium">
                        Báo cáo hiện trường và đánh giá mức độ nghiêm trọng.
                    </SheetDescription>
                </SheetHeader>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">
                {/* Description Card */}
                <Card className="p-6 rounded-3xl border-none shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <MessageSquare className="size-5" />
                        <h4 className="text-xs font-black uppercase tracking-widest">Nội dung phản ánh</h4>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">
                        "{selectedIncident.description}"
                    </p>
                    <div className="pt-4 flex flex-wrap gap-4 border-t border-slate-50">
                        <DetailItem icon={Calendar} label="Thời gian" value={new Date(selectedIncident.reportedDate).toLocaleString("vi-VN")} />
                        <DetailItem icon={User} label="Người báo cáo" value={selectedIncident.reporterName || "Người dân ẩn danh"} />
                        <DetailItem icon={MapPin} label="Tại cây" value={selectedIncident.treeName} />
                    </div>
                </Card>

                {/* Evidence Image */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-400 px-1">
                        <ImageIcon className="size-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Ảnh minh chứng hiện trường</h4>
                    </div>
                    {selectedIncident.images && selectedIncident.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {selectedIncident.images.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-3xl bg-slate-200 overflow-hidden border-4 border-white shadow-md">
                                    <img src={getImageUrl(img)} alt="Evidence" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
                            <ImageIcon className="size-10 text-slate-300 mx-auto mb-2 opacity-50" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Không có ảnh minh chứng</p>
                        </div>
                    )}
                </div>

                {/* Admin Actions */}
                {isAdmin && selectedIncident.status === "Pending" && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Điều phối xử lý (Tùy chọn)</Label>
                            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                                <SelectTrigger className="rounded-2xl h-12 border-none bg-white shadow-sm px-5">
                                    <SelectValue placeholder="Chọn Đội trưởng phụ trách..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    {teams.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id} className="font-bold text-xs">
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Lý do từ chối (nếu có)</Label>
                            <Input 
                                placeholder="Nhập lý do nếu bạn từ chối báo cáo này..." 
                                className="h-12 border-none bg-white shadow-sm rounded-2xl px-5 text-sm font-medium"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button 
                                className="bg-green-600 hover:bg-green-700 h-14 rounded-2xl font-black gap-2 shadow-xl shadow-green-600/20"
                                onClick={() => handleApprove(selectedIncident.id)}
                            >
                                <ShieldCheck className="size-5" /> DUYỆT XỬ LÝ
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-14 rounded-2xl font-black gap-2 border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                                onClick={() => handleReject(selectedIncident.id)}
                            >
                                <ShieldAlert className="size-5" /> TỪ CHỐI
                            </Button>
                        </div>
                    </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function StatusCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  const colors: any = {
    green: "bg-green-500/10 text-green-600 ring-green-500/20",
    orange: "bg-orange-500/10 text-orange-600 ring-orange-500/20",
    red: "bg-red-500/10 text-red-600 ring-red-500/20",
    blue: "bg-blue-500/10 text-blue-600 ring-blue-500/20"
  }
  return (
    <Card className="p-5 border-none shadow-lg shadow-slate-200/50 rounded-3xl flex items-center gap-4 bg-white/80 backdrop-blur-sm group hover:scale-[1.02] transition-all cursor-default">
      <div className={cn("size-12 rounded-2xl flex items-center justify-center ring-1 transition-transform group-hover:rotate-12", colors[color])}>
        <Icon className="size-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-2xl font-black text-slate-800 leading-none tracking-tighter">{value}</p>
      </div>
    </Card>
  )
}

function DetailItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
                <Icon className="size-3" />
                <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-xs font-bold text-slate-700">{value}</p>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
  const safeStatus = status || "Pending"
  const styles: any = {
    Pending: "bg-orange-500 text-white shadow-orange-500/20",
    InProgress: "bg-blue-500 text-white shadow-blue-500/20",
    Resolved: "bg-green-500 text-white shadow-green-500/20"
  }
  const labels: any = {
    Pending: "CHỜ DUYỆT",
    InProgress: "ĐANG XỬ LÝ",
    Resolved: "HOÀN THÀNH"
  }
  return (
    <Badge className={cn("text-[10px] font-black px-2.5 py-0.5 rounded-full border-none shadow-lg", styles[safeStatus])}>
      {labels[safeStatus] || (safeStatus ? safeStatus.toUpperCase() : "")}
    </Badge>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const safeSeverity = severity || "Low"
  const styles: any = {
    High: "bg-red-100 text-red-600",
    Medium: "bg-orange-100 text-orange-600",
    Low: "bg-slate-100 text-slate-500",
  }
  const labels: any = {
    High: "KHẨN CẤP",
    Medium: "TRUNG BÌNH",
    Low: "THẤP",
  }
  return (
    <Badge variant="outline" className={cn("text-[9px] font-black px-2 py-0.5 rounded-lg border-none", styles[safeSeverity])}>
      {labels[safeSeverity] || (safeSeverity ? safeSeverity.toUpperCase() : "")}
    </Badge>
  )
}
