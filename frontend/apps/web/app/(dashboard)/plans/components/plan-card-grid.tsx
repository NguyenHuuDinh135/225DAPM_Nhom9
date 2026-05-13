"use client"

import {
  SearchIcon, Loader2, User, ArrowRight,
  ChevronRight, ChevronLeft
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

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

interface PlanCardGridProps {
  plans: PlanDto[]
  loading: boolean
  search: string
  onSearchChange: (value: string) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPlanClick: (plan: PlanDto) => void
}

export function PlanCardGrid({
  plans, loading, search, onSearchChange,
  page, pageSize, onPageChange, onPlanClick
}: PlanCardGridProps) {
  const filteredPlans = plans.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )
  const paginatedPlans = filteredPlans.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filteredPlans.length / pageSize)

  return (
    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Lộ trình vận hành ({filteredPlans.length})</h3>
        <div className="relative w-full md:w-96">
          <SearchIcon className="absolute left-3.5 top-3 size-4 text-slate-400" />
          <Input
            className="pl-11 h-11 text-xs rounded-xl border-none bg-slate-100/50 focus-visible:ring-primary"
            placeholder="Tìm kiếm tên kế hoạch..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
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
              onClick={() => onPlanClick(plan)}
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
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Draft: "bg-slate-100 text-slate-600",
    PendingApproval: "bg-primary/10 text-primary",
    NeedsRevision: "bg-orange-100 text-orange-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    InProgress: "bg-primary text-white",
    Completed: "bg-slate-500 text-white",
  }
  const labels: Record<string, string> = {
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
