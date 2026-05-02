"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { ClipboardList, CheckCircle2, AlertTriangle, TrendingUp, Loader2, MapPin, Eye, Zap } from "lucide-react"
import { ChartAreaInteractive } from "./chart-area-interactive"
import { SectionCards, type DashboardStats } from "./section-cards"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@workspace/ui/components/sonner"
import Link from "next/link"
import { PlanDetailSheet } from "../plans/components/plan-detail-sheet"
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle,
    SheetDescription 
} from "@workspace/ui/components/sheet"
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

import { cn } from "@workspace/ui/lib/utils"

interface DirectorDashboardProps {
  stats: DashboardStats;
  onRefresh: () => void;
}

interface PendingPlan {
  id: number
  name: string
  status: string
}

interface EmergencyIncident {
    id: number;
    description: string;
    severity: string;
    status: string;
    treeId: number;
    treeName: string;
}

export function DirectorDashboard({ stats, onRefresh }: DirectorDashboardProps) {
  const { user } = useAuth()
  const [pendingPlans, setPendingPlans] = useState<PendingPlan[]>([])
  const [emergencyIncidents, setEmergencyIncidents] = useState<EmergencyIncident[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<number | null>(null)
  
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [planSheetOpen, setPlanSheetOpen] = useState(false)
  
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null)
  const [incidentSheetOpen, setIncidentSheetOpen] = useState(false)
  
  const [isGlobalApproveOpen, setIsGlobalApproveOpen] = useState(false)

  useEffect(() => {
    if (user) {
        loadData()
    }
  }, [user])

  async function loadData() {
    setLoading(true)
    try {
      const [plansData, incidentsData] = await Promise.all([
        apiClient.get<any>("/api/planning"),
        apiClient.get<any>("/api/tree-incidents")
      ])
      
      const plans = Array.isArray(plansData) ? plansData : (plansData?.items || []);
      // Giám đốc chỉ xem các kế hoạch ĐANG CHỜ DUYỆT (PendingApproval)
      setPendingPlans(plans.filter((p: any) => p.status === "PendingApproval").slice(0, 3))
      
      const incidents = incidentsData?.treeIncidents || [];
      setEmergencyIncidents(incidents.filter((i: any) => i.status === "Pending").slice(0, 2))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveIncident = async (id: number) => {
    toast.loading("Đang phê duyệt sự cố...");
    try {
        await apiClient.put(`/api/tree-incidents/${id}/approve`, {
            id,
            approverId: user?.id || ""
        });
        toast.dismiss();
        toast.success("Đã phê duyệt sự cố", { description: "Lệnh điều phối đã được gửi đến các đội hiện trường." });
        setIncidentSheetOpen(false);
        loadData();
        onRefresh();
    } catch (err: any) {
        toast.dismiss();
        toast.error("Lỗi", { description: err.message || "Không thể phê duyệt sự cố." });
    }
  }

  const handleApprovePlan = async (id: number) => {
    setActingId(id);
    toast.loading("Đang phê duyệt kế hoạch...");
    try {
        await apiClient.put(`/api/planning/${id}/approve`, {
            id,
            approverId: user?.id || ""
        });
        toast.dismiss();
        toast.success("Phê duyệt thành công", { description: `Kế hoạch #${id} đã được kích hoạt.` });
        loadData();
        onRefresh();
    } catch (err: any) {
        toast.dismiss();
        toast.error("Lỗi", { description: err.message || "Không thể phê duyệt kế hoạch." });
    } finally {
        setActingId(null);
    }
  }

  const handleGlobalApprove = async () => {
    if (pendingPlans.length === 0 && emergencyIncidents.length === 0) {
        toast.info("Không có gì để phê duyệt", { description: "Mọi thứ đã được xử lý xong." });
        return;
    }
    setIsGlobalApproveOpen(true);
  }

  const executeGlobalApprove = async () => {
    setIsGlobalApproveOpen(false);
    toast.loading("Đang phê duyệt tổng thể...");
    try {
        // Approve all plans
        for (const plan of pendingPlans) {
            await apiClient.put(`/api/planning/${plan.id}/approve`, {
                id: plan.id,
                approverId: user?.id || ""
            });
        }
        // Approve all incidents
        for (const inc of emergencyIncidents) {
            await apiClient.put(`/api/tree-incidents/${inc.id}/approve`, {
                id: inc.id,
                approverId: user?.id || ""
            });
        }
        toast.dismiss();
        toast.success("Hoàn tất phê duyệt tổng thể", { description: "Tất cả các mục đã được xử lý thành công." });
        loadData();
        onRefresh();
    } catch (err: any) {
        toast.dismiss();
        toast.error("Lỗi phê duyệt tổng thể", { description: "Một số mục có thể chưa được duyệt. Vui lòng kiểm tra lại." });
        loadData();
    }
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 bg-slate-50/50 min-h-screen">
      {/* AlertDialog for Global Approve */}
      <AlertDialog open={isGlobalApproveOpen} onOpenChange={setIsGlobalApproveOpen}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl glass">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800">Xác nhận phê duyệt tổng thể</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500">
              Bạn có chắc muốn phê duyệt TẤT CẢ {pendingPlans.length} kế hoạch và {emergencyIncidents.length} sự cố? 
              Hành động này sẽ kích hoạt tất cả các lệnh điều phối và kế hoạch đang chờ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Hủy</AlertDialogCancel>
            <AlertDialogAction 
                onClick={executeGlobalApprove} 
                className="bg-primary hover:bg-primary/90 text-white rounded-xl font-black shadow-lg shadow-primary/20"
            >
              Xác nhận phê duyệt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sheets for Detail views */}
      <PlanDetailSheet 
        planId={selectedPlanId} 
        open={planSheetOpen} 
        onOpenChange={setPlanSheetOpen}
        onRefresh={() => {
          loadData()
          onRefresh()
        }}
      />

      <Sheet open={incidentSheetOpen} onOpenChange={setIncidentSheetOpen}>
        <SheetContent className="sm:max-w-md rounded-l-[3rem] border-none shadow-2xl p-0 overflow-hidden glass">
            <div className="h-2 bg-red-500 w-full" />
            <div className="p-8">
                <SheetHeader className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                            <AlertTriangle className="size-5" />
                        </div>
                        <Badge variant="outline" className="text-red-600 border-red-200 font-black uppercase tracking-widest text-[10px]">Cảnh báo khẩn cấp</Badge>
                    </div>
                    <SheetTitle className="text-2xl font-black text-slate-800">Sự cố #{selectedIncident?.id}</SheetTitle>
                    <SheetDescription className="font-bold text-slate-500">Thông tin chi tiết hiện trường và yêu cầu điều phối.</SheetDescription>
                </SheetHeader>

                {selectedIncident && (
                    <div className="space-y-8">
                        <div className="space-y-4 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Cây xanh</label>
                                <p className="font-black text-slate-800 flex items-center gap-2">
                                    <MapPin className="size-4 text-blue-500" /> {selectedIncident.treeName}
                                </p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Mô tả sự cố</label>
                                <p className="font-bold text-slate-700 leading-relaxed">{selectedIncident.description}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Mức độ</label>
                                <Badge className="bg-red-600 text-white font-black px-4 py-1 rounded-full">{selectedIncident.severity}</Badge>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button 
                                className="w-full bg-primary hover:bg-primary/90 text-white font-black h-14 rounded-2xl shadow-xl shadow-primary/20 text-lg transition-all hover:scale-[1.02] active:scale-95"
                                onClick={() => handleApproveIncident(selectedIncident.id)}
                            >
                                PHÊ DUYỆT ĐIỀU PHỐI
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="w-full font-bold text-slate-400 h-12 rounded-2xl hover:bg-slate-100 transition-all"
                                onClick={() => setIncidentSheetOpen(false)}
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </SheetContent>
      </Sheet>

      {/* Title section ALWAYS visible */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Bảng điều khiển Giám đốc</h1>
          <p className="text-sm text-slate-500 font-medium mt-1 italic">Tối ưu hóa nguồn lực và phê duyệt chiến lược 24/7.</p>
        </div>
        <div className="flex gap-3">
            <Button 
                asChild
                variant="outline" 
                className="rounded-2xl h-12 px-6 font-bold border-slate-200 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
                <Link href="/plans">LẬP CHIẾN LƯỢC</Link>
            </Button>
            <Button 
                className="rounded-2xl h-12 px-6 font-black bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                onClick={handleGlobalApprove}
            >
                PHÊ DUYỆT TỔNG THỂ
            </Button>
        </div>
      </div>

      <SectionCards stats={stats} />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Chart Card */}
        <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
          <CardHeader className="bg-white/40 border-b border-slate-50 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black text-slate-800">Thống kê Công tác Toàn thành phố</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Chu kỳ 30 ngày gần nhất</CardDescription>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
                    <TrendingUp className="size-6" />
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[400px]">
                <ChartAreaInteractive />
            </div>
          </CardContent>
        </Card>

        {/* Approval Card */}
        <Card className="border-none shadow-2xl shadow-amber-200/20 rounded-[2.5rem] overflow-hidden flex flex-col bg-white">
          <CardHeader className="bg-amber-500/5 border-b border-amber-500/10 p-8">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black text-amber-700">Duyệt nhanh</CardTitle>
              <div className="p-3 bg-white shadow-xl rounded-2xl text-amber-600 border border-amber-100">
                <Zap className="size-6 fill-amber-500" />
              </div>
            </div>
            <CardDescription className="font-bold text-amber-600/60 uppercase text-[10px] tracking-widest mt-1">Kế hoạch cần ý kiến lãnh đạo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-8 flex-1 bg-gradient-to-b from-amber-500/5 to-transparent">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500 size-10" /></div>
            ) : pendingPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="size-16 rounded-3xl bg-green-50 flex items-center justify-center mb-4">
                    <CheckCircle2 className="size-8 text-green-500" />
                </div>
                <p className="text-sm font-bold text-slate-500 italic">Mọi kế hoạch đã được xử lý.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPlans.map(plan => (
                    <div key={plan.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/30 transition-all hover:scale-[1.03] hover:shadow-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">KẾ HOẠCH #{plan.id}</span>
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none text-[9px] font-black px-3 py-1 rounded-full">ĐANG CHỜ</Badge>
                    </div>
                    <p className="text-base font-black text-slate-800 line-clamp-1 group-hover:text-amber-600 transition-colors mb-6">{plan.name}</p>
                    <div className="flex gap-3">
                        <Button 
                            className="flex-1 bg-primary hover:bg-primary/90 text-white font-black h-12 rounded-2xl shadow-lg shadow-primary/20 gap-2 transition-all hover:scale-[1.05] active:scale-95"
                            onClick={() => handleApprovePlan(plan.id)}
                            disabled={actingId === plan.id}
                        >
                            {actingId === plan.id ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} DUYỆT
                        </Button>
                        <Button 
                            variant="outline" 
                            className="size-12 rounded-2xl p-0 font-bold border-slate-200 hover:bg-slate-50 transition-all active:scale-95" 
                            onClick={() => {
                                setSelectedPlanId(plan.id)
                                setPlanSheetOpen(true)
                            }}
                        >
                            <Eye className="size-5 text-slate-400" />
                        </Button>
                    </div>
                    </div>
                ))}
              </div>
            )}
            
            {/* Emergency Alerts Section */}
            <div className="mt-auto space-y-4 pt-6 border-t border-slate-100">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Cảnh báo Khẩn cấp ({emergencyIncidents.length})</h4>
               {emergencyIncidents.map(inc => (
                  <div key={inc.id} className="rounded-3xl border border-red-100 bg-red-50/50 p-5 shadow-inner group cursor-pointer hover:bg-red-50 transition-colors"
                       onClick={() => { setSelectedIncident(inc); setIncidentSheetOpen(true); }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">#{inc.id} - {inc.treeName}</span>
                        <div className="size-2 rounded-full bg-red-500 animate-ping" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{inc.description}</p>
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-[9px] font-black text-red-600 uppercase bg-white px-2 py-1 rounded-lg">CẦN XEM NGAY</span>
                        <Button variant="ghost" size="sm" className="h-7 rounded-xl font-black text-[10px] text-red-600 gap-1 p-0 hover:bg-transparent">
                           XEM HIỆN TRƯỜNG <ChevronRight className="size-3" />
                        </Button>
                    </div>
                  </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatusMiniCard icon={TrendingUp} label="Mật độ bao phủ" value="24.5%" color="blue" />
          <StatusMiniCard icon={CheckCircle2} label="KPI Hoàn thành" value="92%" color="purple" />
          <StatusMiniCard icon={AlertTriangle} label="Rủi ro thiên tai" value="Thấp" color="orange" />
          <StatusMiniCard icon={Zap} label="Công suất AI" value="Tối ưu" color="green" />
      </div>
    </div>
  )
}

function StatusMiniCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  const colorStyles: any = {
    blue: "bg-white text-blue-600",
    purple: "bg-white text-purple-600",
    orange: "bg-white text-orange-600",
    green: "bg-white text-green-600",
  }
  const iconBg: any = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  }
  return (
    <Card className={cn("p-6 flex items-center gap-5 transition-all hover:-translate-y-2 hover:shadow-2xl border-none shadow-lg shadow-slate-200/50 rounded-[2rem]", colorStyles[color])}>
      <div className={cn("size-14 rounded-2xl flex items-center justify-center shadow-inner", iconBg[color])}>
          <Icon className="size-7" />
      </div>
      <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">{label}</p>
          <p className="text-3xl font-black tracking-tighter text-slate-800">{value}</p>
      </div>
    </Card>
  )
}

function ChevronRight({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
}
