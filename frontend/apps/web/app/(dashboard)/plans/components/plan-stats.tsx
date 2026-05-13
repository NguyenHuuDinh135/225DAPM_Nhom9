"use client"

import { ClipboardList, Clock, CheckCircle2 } from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

interface PlanStatsProps {
  plans: { status: string }[]
}

export function PlanStats({ plans }: PlanStatsProps) {
  const runningCount = plans.filter(p => p.status === "Approved" || p.status === "InProgress").length
  const pendingCount = plans.filter(p => p.status === "PendingApproval").length
  const completedCount = plans.filter(p => p.status === "Completed").length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard icon={ClipboardList} label="Kế hoạch đang chạy" value={runningCount.toString()} color="primary" />
      <StatsCard icon={Clock} label="Chờ phê duyệt" value={pendingCount.toString()} color="orange" />
      <StatsCard icon={CheckCircle2} label="Đã hoàn thành" value={completedCount.toString()} color="green" />
    </div>
  )
}

function StatsCard({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string, color: string }) {
  const colors: Record<string, string> = {
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
