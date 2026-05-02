import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Users, Calendar, MapPin, Sparkles, Plus, Loader2 } from "lucide-react"
import { FullDashboardMap } from "./full-dashboard-map"
import { SectionCards, type DashboardStats } from "./section-cards"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { useEffect, useState } from "react"
import { PlanFormDialog } from "../plans/components/plan-form-dialog"
import { AutoPlanDialog } from "../plans/components/auto-plan-dialog"

interface AISuggestion {
  message: string;
  suggestedTreeIds: number[];
  suggestedTreeNames: string[];
}

interface CaptainDashboardProps {
  stats: DashboardStats;
  onRefresh: () => void;
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
...

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
