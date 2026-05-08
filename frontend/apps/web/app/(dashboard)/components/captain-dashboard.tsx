import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import {
  Users, Calendar, MapPin, Sparkles, Plus, Loader2,
  Clock, ThumbsUp, ThumbsDown, ChevronRight, CheckCircle2, TreePine,
} from "lucide-react"
import { FullDashboardMap } from "./full-dashboard-map"
import { SectionCards, type DashboardStats } from "./section-cards"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { useEffect, useState } from "react"
import { AutoPlanDialog } from "../plans/components/auto-plan-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

interface AISuggestion {
  message: string;
  suggestedTreeIds: number[];
  suggestedTreeNames: string[];
}

interface CaptainDashboardProps {
  stats: DashboardStats;
  onRefresh: () => void;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingWork {
  id: number
  workTypeName: string | null
  planName: string | null
  treeName: string
  assignedUserNames: string[]
  endDate: string | null
}

// ─── Pending Approval Section ─────────────────────────────────────────────────

function PendingApprovalSection({ onApproved }: { onApproved: () => void }) {
  const [items, setItems] = useState<PendingWork[]>([])
  const [loading, setLoading] = useState(true)
  const [approveTarget, setApproveTarget] = useState<{ id: number; action: "approve" | "reject" } | null>(null)
  const [feedback, setFeedback] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await apiClient.get<any>("/api/work-items")
      const waiting: PendingWork[] = (res?.workItems ?? [])
        .filter((w: any) => w.status === "WaitingForApproval")
        .map((w: any) => ({
          id: w.id,
          workTypeName: w.workTypeName ?? null,
          planName: w.planName ?? null,
          treeName:
            w.treeLocations?.[0]?.treeName ||
            `Cây #${w.treeLocations?.[0]?.treeId ?? "?"}`,
          assignedUserNames: (w.assignedUsers ?? [])
            .map((u: any) => u.userName ?? u.userId?.substring(0, 8))
            .filter(Boolean),
          endDate: w.endDate ?? null,
        }))
      setItems(waiting)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleConfirm() {
    if (!approveTarget) return
    if (approveTarget.action === "reject" && !feedback.trim()) {
      toast.error("Vui lòng nhập lý do từ chối")
      return
    }
    setSubmitting(true)
    try {
      await apiClient.put(`/api/work-items/${approveTarget.id}/approve`, {
        isApproved: approveTarget.action === "approve",
        feedback: approveTarget.action === "reject" ? feedback : null,
      })
      toast.success(
        approveTarget.action === "approve"
          ? "Đã duyệt — công tác hoàn thành!"
          : "Đã từ chối — nhân viên sẽ thực hiện lại"
      )
      setApproveTarget(null)
      setFeedback("")
      load()
      onApproved()
    } catch (err: any) {
      toast.error(err.message || "Thao tác thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card className="glass-card border-purple-500/20 shadow-2xl overflow-hidden">
        <CardHeader className="bg-purple-500/5 border-b border-purple-500/10 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Clock className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest">
                  Chờ duyệt
                </CardTitle>
                <p className="text-[10px] text-purple-600/60 font-bold mt-0.5">
                  Nhân viên đã báo cáo hoàn thành
                </p>
              </div>
            </div>
            {!loading && items.length > 0 && (
              <div className="size-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-purple-500/30 animate-pulse">
                {items.length}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="size-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <CheckCircle2 className="size-6 text-green-500" />
              </div>
              <p className="text-xs font-bold text-muted-foreground">Không có công tác nào chờ duyệt</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {items.map((item) => (
                <div key={item.id} className="p-4 hover:bg-purple-50/30 transition-colors group">
                  {/* Info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.workTypeName && (
                          <Badge className="bg-purple-100 text-purple-700 border-none text-[10px] font-black px-2 py-0.5 rounded-full">
                            {item.workTypeName}
                          </Badge>
                        )}
                        <span className="text-[10px] font-bold text-muted-foreground">#{item.id}</span>
                      </div>
                      <p className="text-sm font-black text-foreground truncate group-hover:text-purple-700 transition-colors">
                        {item.treeName}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        {item.planName && (
                          <span className="text-[10px] font-semibold text-muted-foreground truncate max-w-[140px]">
                            {item.planName}
                          </span>
                        )}
                        {item.assignedUserNames.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                            <Users className="size-3" />
                            {item.assignedUserNames.slice(0, 2).join(", ")}
                            {item.assignedUserNames.length > 2 && ` +${item.assignedUserNames.length - 2}`}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Xem tiến độ */}
                    <Button variant="ghost" size="icon" className="size-8 rounded-xl shrink-0 text-muted-foreground hover:text-purple-600" asChild>
                      <Link href={`/works/${item.id}/progress`}>
                        <ChevronRight className="size-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => { setApproveTarget({ id: item.id, action: "approve" }); setFeedback("") }}
                      className="h-9 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md shadow-green-600/20 transition-all active:scale-95"
                    >
                      <ThumbsUp className="mr-1.5 size-3.5" /> Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setApproveTarget({ id: item.id, action: "reject" }); setFeedback("") }}
                      className="h-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-all active:scale-95"
                    >
                      <ThumbsDown className="mr-1.5 size-3.5" /> Từ chối
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="p-3 border-t border-border/40">
              <Button variant="ghost" size="sm" className="w-full h-8 rounded-xl text-xs font-bold hover:bg-purple-50 hover:text-purple-700" asChild>
                <Link href="/works">Xem tất cả công tác</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <AlertDialog open={!!approveTarget} onOpenChange={(o) => { if (!o) { setApproveTarget(null); setFeedback("") } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {approveTarget?.action === "approve" ? "Xác nhận duyệt công tác" : "Từ chối công tác"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {approveTarget?.action === "approve"
                ? `Duyệt công tác #${approveTarget?.id} — trạng thái sẽ chuyển sang Hoàn thành.`
                : `Từ chối công tác #${approveTarget?.id} — nhân viên sẽ tiếp tục thực hiện lại.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {approveTarget?.action === "reject" && (
            <div className="space-y-2 px-1">
              <Label htmlFor="cap-feedback" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Lý do từ chối <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="cap-feedback"
                placeholder="VD: Ảnh chưa rõ nét, cần chụp lại toàn bộ cây..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="rounded-xl border-muted-foreground/10 bg-muted/30 text-sm"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              onClick={(e) => { e.preventDefault(); handleConfirm() }}
              className={cn(
                approveTarget?.action === "approve"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              {submitting
                ? <><Loader2 className="mr-2 size-4 animate-spin" /> Đang xử lý...</>
                : approveTarget?.action === "approve" ? "Duyệt hoàn thành" : "Xác nhận từ chối"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function CaptainDashboard({ stats, onRefresh }: CaptainDashboardProps) {
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [autoPlanOpen, setAutoPlanOpen] = useState(false)
  const [recentPlans, setRecentPlans] = useState<any[]>([])

  useEffect(() => {
    async function loadAi() {
      setAiLoading(true)
      try {
        const data = await apiClient.get<AISuggestion>("/api/planning/ai-suggestions")
        setAiSuggestion(data)
      } catch (err) {
        setAiSuggestion(null)
      } finally {
        setAiLoading(false)
      }
    }
    loadAi()
    loadRecentPlans()
  }, [])

  async function loadRecentPlans() {
    try {
      const data = await apiClient.get<any[]>("/api/planning")
      setRecentPlans(data.slice(0, 3))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary">Khu vực Đội trưởng</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Điều phối nhân sự và lập kế hoạch bảo trì.</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 font-bold gap-3 text-base">
          <Plus className="size-5" /> Lập kế hoạch mới
        </Button>
      </div>

      <AutoPlanDialog 
        open={autoPlanOpen}
        onOpenChange={setAutoPlanOpen}
        onSuccess={() => {
          onRefresh()
          loadRecentPlans()
        }}
      />
      <SectionCards stats={stats} />


      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card className="h-full overflow-hidden glass-card border-border/40 shadow-2xl flex flex-col">
            <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black">Bản đồ Hiện trường</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-wider">Theo dõi vị trí cây xanh và sự cố thời gian thực</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl font-bold border-primary/20 hover:bg-primary/10 transition-all">
                        <MapPin className="mr-2 size-4 text-primary" /> Toàn cảnh
                    </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[600px] relative">
              <FullDashboardMap />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* ── Chờ duyệt (ưu tiên cao nhất) ── */}
          <PendingApprovalSection onApproved={onRefresh} />

          {/* ── AI gợi ý ── */}
          <Card className="glass-card border-blue-500/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-blue-500/5 border-b border-blue-500/10 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Trợ lý AI gợi ý</CardTitle>
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600">
                  <Sparkles className="size-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-5 bg-gradient-to-b from-blue-500/5 to-transparent">
               <div className="text-xs font-medium leading-relaxed text-muted-foreground bg-background/50 backdrop-blur-md p-4 rounded-2xl border border-blue-500/10 italic min-h-[80px] flex items-center justify-center shadow-inner text-center">
                {aiLoading ? (
                  <Loader2 className="size-5 animate-spin text-blue-400" />
                ) : (
                  aiSuggestion ? `"${aiSuggestion.message}"` : "Đang phân tích dữ liệu cây xanh..."
                )}
               </div>
               <Button 
                size="sm" 
                className="w-full h-10 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all" 
                disabled={aiLoading || !aiSuggestion || aiSuggestion.suggestedTreeIds.length === 0}
                onClick={() => setAutoPlanOpen(true)}
              >
                 Phác thảo ngay
               </Button>
            </CardContent>
          </Card>

          {/* ── Trạng thái nhân sự ── */}
          <Card className="glass-card border-border/40 shadow-xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
              <CardTitle className="text-sm font-black text-primary/70 uppercase tracking-widest">Trình trạng nhân sự</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-5">
               {[
                 { name: "Lê Văn Nhân Viên", status: "Bận", cls: "bg-amber-500" },
                 { name: "Phạm Thị Công Nhân", status: "Sẵn sàng", cls: "bg-green-500" },
                 { name: "Nguyễn Thị Hoa", status: "Nghỉ", cls: "bg-red-500" },
                 { name: "Trần Văn Bình", status: "Bận", cls: "bg-amber-500" },
               ].map((emp) => (
                 <div key={emp.name} className="flex items-center justify-between text-sm p-2 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`size-2.5 rounded-full shadow-xs ${emp.cls} animate-pulse`} />
                        <span className="font-bold text-foreground/80">{emp.name}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-tighter opacity-70`}>{emp.status}</span>
                 </div>
               ))}
               <Button variant="ghost" size="sm" className="w-full h-9 rounded-xl text-xs font-bold mt-2 hover:bg-primary/5 hover:text-primary">Xem tất cả</Button>
            </CardContent>
          </Card>

          {/* ── Kế hoạch gần đây ── */}
          <Card className="glass-card border-border/40 shadow-xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
              <CardTitle className="text-sm font-black text-primary/70 uppercase tracking-widest">Kế hoạch gần đây</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-5">
               {recentPlans.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                   <Calendar className="size-8 mb-2" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">Chưa có kế hoạch</p>
                 </div>
               ) : recentPlans.map((plan) => (
                 <div key={plan.id} className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/20 border border-transparent hover:border-primary/10 transition-all hover:bg-muted/40 group cursor-pointer">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-xs truncate max-w-[130px] group-hover:text-primary transition-colors">{plan.name}</span>
                        <Badge variant="outline" className="text-[9px] h-5 px-1.5 font-black uppercase border-none bg-primary/10 text-primary">
                            {plan.statusName}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold uppercase tracking-tight">
                        <Calendar className="size-2.5" />
                        {plan.startDate ? new Date(plan.startDate).toLocaleDateString("vi-VN") : "—"}
                    </div>
                 </div>
               ))}
               <Button variant="ghost" size="sm" className="w-full h-9 rounded-xl text-xs font-bold mt-2 hover:bg-primary/5 hover:text-primary" asChild>
                 <Link href="/plans">Xem tất cả kế hoạch</Link>
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
