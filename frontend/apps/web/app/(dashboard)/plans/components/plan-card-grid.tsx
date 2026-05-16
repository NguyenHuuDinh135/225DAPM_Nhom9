"use client"

import {
  SearchIcon,
  Loader2,
  User,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"

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

interface PlanCardGridProps {
  plans: PlanDto[]
  loading: boolean
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPlanClick: (plan: PlanDto) => void
}

export function PlanCardGrid({
  plans,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  pageSize,
  onPageChange,
  onPlanClick,
}: PlanCardGridProps) {
  const filteredPlans = plans.filter(
    (p) =>
      (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || p.status === statusFilter)
  )
  const paginatedPlans = filteredPlans.slice(
    (page - 1) * pageSize,
    page * pageSize
  )
  const totalPages = Math.ceil(filteredPlans.length / pageSize)

  return (
    <Card className="overflow-hidden rounded-[2rem] border-none bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-6 border-b border-slate-50 bg-white/40 p-6 md:flex-row md:items-center">
        <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
          Lộ trình vận hành ({filteredPlans.length})
        </h3>
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          <div className="relative w-full md:w-72">
            <SearchIcon className="absolute top-3 left-3.5 size-4 text-slate-400" />
            <Input
              className="h-11 rounded-xl border-none bg-slate-100/50 pl-11 text-xs focus-visible:ring-primary"
              placeholder="Tìm kiếm tên kế hoạch..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              onStatusFilterChange(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-100/50 text-xs font-bold">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Draft">Bản nhap</SelectItem>
              <SelectItem value="PendingApproval">Cho duyet</SelectItem>
              <SelectItem value="NeedsRevision">Can sua</SelectItem>
              <SelectItem value="Approved">Da duyet</SelectItem>
              <SelectItem value="InProgress">Dang chay</SelectItem>
              <SelectItem value="Completed">Hoan thanh</SelectItem>
              <SelectItem value="Rejected">Bi tu choi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 divide-x divide-y divide-slate-50 border-t border-slate-50 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-4 py-20 text-center">
            <Loader2 className="mx-auto mb-2 size-10 animate-spin text-primary" />
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Đang tải chiến lược...
            </p>
          </div>
        ) : paginatedPlans.length > 0 ? (
          paginatedPlans.map((plan) => (
            <div
              key={plan.id}
              className="group relative cursor-pointer overflow-hidden p-6 transition-all hover:bg-primary/5"
              onClick={() => onPlanClick(plan)}
            >
              <div className="absolute -right-4 -bottom-4 size-24 rounded-full bg-slate-100 opacity-0 transition-all duration-700 group-hover:scale-150 group-hover:opacity-100" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="rounded-lg border-slate-200 bg-white px-2 py-0.5 text-[9px] font-black text-slate-500"
                  >
                    #{plan.id}
                  </Badge>
                  <StatusBadge status={plan.status} />
                </div>

                <div>
                  <h4 className="line-clamp-2 text-sm leading-tight font-black text-slate-800 transition-colors group-hover:text-primary">
                    {plan.name}
                  </h4>
                  <div className="mt-2 flex items-center gap-2 text-slate-400">
                    <User className="size-3" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">
                      {plan.creatorName || "Hệ thống"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100/50 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-300 uppercase">
                      Thời hạn
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">
                      {new Date(plan.startDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <ArrowRight className="size-4 text-slate-200 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-4 py-20 text-center font-medium text-slate-400 italic">
            Không tìm thấy kế hoạch nào.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/50 p-4">
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
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
    Completed: "HOÀN THÀNH",
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
