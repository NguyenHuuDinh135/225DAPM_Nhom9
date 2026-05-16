"use client"

import * as React from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Leaf,
  TrendingUp,
} from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { ChartAreaInteractive } from "@/app/(dashboard)/components/chart-area-interactive"
import { apiClient } from "@/lib/api-client"
import { cn } from "@workspace/ui/lib/utils"

interface DashboardStatsVm {
  totalTrees: number
  totalStreets: number
  totalWards: number
  pendingIncidents: number
  completedWorksThisMonth: number
  pendingWorksThisMonth: number
}

interface PlanDto {
  id: number
  status: string | null
}

const STATUS_LABELS: Record<string, string> = {
  Draft: "Bản nháp",
  PendingApproval: "Chờ duyệt",
  NeedsRevision: "Cần sửa",
  Approved: "Đã duyệt",
  InProgress: "Đang triển khai",
  Completed: "Hoàn thành",
  Rejected: "Bị từ chối",
}

export default function AnalyticsPage() {
  const [stats, setStats] = React.useState<DashboardStatsVm | null>(null)
  const [plans, setPlans] = React.useState<PlanDto[]>([])
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [dashboard, planList] = await Promise.all([
        apiClient.get<DashboardStatsVm>("/api/reports/dashboard-stats"),
        apiClient.get<PlanDto[]>("/api/Planning").catch(() => []),
      ])
      setStats(dashboard)
      setPlans(Array.isArray(planList) ? planList : [])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const completionRate = React.useMemo(() => {
    if (!stats) return 0
    const total = stats.completedWorksThisMonth + stats.pendingWorksThisMonth
    if (!total) return 0
    return Math.round((stats.completedWorksThisMonth / total) * 100)
  }, [stats])

  const pressureIndex = React.useMemo(() => {
    if (!stats) return 0
    const raw = stats.pendingIncidents * 8 + stats.pendingWorksThisMonth * 2
    return Math.min(100, raw)
  }, [stats])

  const planStats = React.useMemo(() => {
    const counters: Record<string, number> = {
      Draft: 0,
      PendingApproval: 0,
      NeedsRevision: 0,
      Approved: 0,
      InProgress: 0,
      Completed: 0,
      Rejected: 0,
    }
    plans?.forEach((plan) => {
      if (plan.status && counters[plan.status] !== undefined) {
        counters[plan.status]! += 1
      }
    })
    return counters
  }, [plans])

  const planTotal = Object.values(planStats).reduce((sum, v) => sum + v, 0)

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 md:py-10">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[radial-gradient(circle_at_top,_#d1fae5_0%,_#f8fafc_55%,_#eef2ff_100%)] p-8 shadow-xl shadow-emerald-100/40">
        <div className="absolute top-6 right-6 h-28 w-28 rounded-full bg-emerald-200/60 blur-2xl" />
        <div className="absolute bottom-0 -left-10 h-32 w-32 rounded-full bg-blue-200/40 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.4em] text-emerald-700/70 uppercase">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Phân tích hệ thống
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-slate-600">
              Bức tranh tổng quan về hiệu suất vận hành, tải sự cố và tiến độ xử
              lý kế hoạch trong toàn hệ thống.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-2xl border-slate-200 bg-white/70 font-bold text-slate-600"
              onClick={load}
            >
              Cập nhật dữ liệu
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          title="Tỷ lệ hoàn thành tháng"
          value={loading ? "..." : `${completionRate}%`}
          icon={CheckCircle2}
          tone="emerald"
          footer="So với tổng công việc phát sinh"
        />
        <InsightCard
          title="Sự cố chờ xử lý"
          value={loading ? "..." : `${stats?.pendingIncidents ?? 0}`}
          icon={AlertTriangle}
          tone="amber"
          footer="Cảnh báo cần phản hồi nhanh"
        />
        <InsightCard
          title="Công việc tồn đọng"
          value={loading ? "..." : `${stats?.pendingWorksThisMonth ?? 0}`}
          icon={ClipboardList}
          tone="blue"
          footer="Chưa hoàn thành trong tháng"
        />
        <InsightCard
          title="Tổng cây quản lý"
          value={loading ? "..." : `${stats?.totalTrees ?? 0}`}
          icon={Leaf}
          tone="teal"
          footer={`Phủ ${stats?.totalStreets ?? 0} tuyến đường`}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Xu hướng vận hành
              </h2>
              <p className="text-xs font-medium tracking-widest text-slate-400 uppercase">
                Công việc hoàn thành & sự cố mới
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
              <TrendingUp className="size-4" /> ổn định
            </div>
          </div>
          <div className="mt-4">
            <ChartAreaInteractive />
          </div>
        </Card>

        <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Chỉ số áp lực
              </h2>
              <p className="text-xs font-medium tracking-widest text-slate-400 uppercase">
                Đánh giá tải xử lý hiện tại
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
              {pressureIndex}/100
            </div>
          </div>
          <div className="mt-6">
            <div className="h-3 w-full rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500"
                style={{ width: `${pressureIndex}%` }}
              />
            </div>
            <div className="mt-4 space-y-3 text-xs font-semibold text-slate-500">
              <StatusLine
                label="Sự cố"
                value={stats?.pendingIncidents ?? 0}
                tone="amber"
              />
              <StatusLine
                label="Việc chờ"
                value={stats?.pendingWorksThisMonth ?? 0}
                tone="blue"
              />
              <StatusLine
                label="Đã hoàn thành"
                value={stats?.completedWorksThisMonth ?? 0}
                tone="emerald"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-xl shadow-slate-200/50">
          <h2 className="text-lg font-black text-slate-900">
            Phân bổ kế hoạch
          </h2>
          <p className="text-xs font-medium tracking-widest text-slate-400 uppercase">
            Theo trạng thái xử lý
          </p>
          <div className="mt-6 space-y-3">
            {Object.entries(planStats).map(([key, value]) => {
              const percent = planTotal
                ? Math.round((value / planTotal) * 100)
                : 0
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{STATUS_LABELS[key] ?? key}</span>
                    <span>{value} kế hoạch</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500/80"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-xl shadow-slate-200/50">
          <h2 className="text-lg font-black text-slate-900">Gợi ý hành động</h2>
          <p className="text-xs font-medium tracking-widest text-slate-400 uppercase">
            Ưu tiên xử lý trong 7 ngày tới
          </p>
          <div className="mt-6 space-y-4">
            <ActionRow
              title="Giảm tồn đọng công việc"
              description={`Phân bổ lại nhân sự để xử lý ${stats?.pendingWorksThisMonth ?? 0} nhiệm vụ chưa hoàn tất.`}
              tone="blue"
            />
            <ActionRow
              title="Xử lý sự cố ưu tiên"
              description={`Tập trung xử lý ${stats?.pendingIncidents ?? 0} sự cố đang chờ để giảm áp lực hệ thống.`}
              tone="amber"
            />
            <ActionRow
              title="Mở rộng phủ xanh"
              description={`Đề xuất mở rộng thêm tại ${stats?.totalWards ?? 0} phường/xã để cân bằng mật độ.`}
              tone="emerald"
            />
          </div>
        </Card>
      </div>
    </div>
  )
}

function InsightCard({
  title,
  value,
  icon: Icon,
  tone,
  footer,
}: {
  title: string
  value: string
  icon: React.ElementType
  tone: "emerald" | "amber" | "blue" | "teal"
  footer: string
}) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    teal: "bg-teal-50 text-teal-700",
  }
  return (
    <Card className="rounded-[2rem] border-none bg-white p-6 shadow-xl shadow-slate-200/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">{footer}</p>
        </div>
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-2xl",
            tones[tone]
          )}
        >
          <Icon className="size-6" />
        </div>
      </div>
    </Card>
  )
}

function StatusLine({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "emerald" | "amber" | "blue"
}) {
  const tones = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
  }
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", tones[tone])} />
        <span>{label}</span>
      </div>
      <span className="text-slate-700">{value}</span>
    </div>
  )
}

function ActionRow({
  title,
  description,
  tone,
}: {
  title: string
  description: string
  tone: "emerald" | "amber" | "blue"
}) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50/70",
    amber: "border-amber-200 bg-amber-50/70",
    blue: "border-blue-200 bg-blue-50/70",
  }
  return (
    <div className={cn("rounded-2xl border p-4", tones[tone])}>
      <p className="text-sm font-black text-slate-800">{title}</p>
      <p className="mt-2 text-xs font-medium text-slate-600">{description}</p>
    </div>
  )
}
