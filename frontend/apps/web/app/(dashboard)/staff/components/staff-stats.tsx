"use client"

import { UsersIcon, Shield, UserCheckIcon } from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { ROLES } from "@/lib/roles"

interface EmployeeDto {
  id: string;
  status: number;
  role: string | null;
}

interface StaffStatsProps {
  employees: EmployeeDto[]
}

export function StaffStats({ employees }: StaffStatsProps) {
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 1).length,
    admins: employees.filter(e => e.role === ROLES.DoiTruong || e.role === ROLES.GiamDoc).length
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatusCard icon={UsersIcon} label="Tổng nhân sự" value={stats.total.toString()} color="blue" />
      <StatusCard icon={Shield} label="Ban điều hành" value={stats.admins.toString()} color="orange" />
      <StatusCard icon={UserCheckIcon} label="Đang tác nghiệp" value={stats.active.toString()} color="green" />
    </div>
  )
}

function StatusCard({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string, color: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-500/10 text-green-600 ring-green-500/20",
    orange: "bg-orange-500/10 text-orange-600 ring-orange-500/20",
    blue: "bg-blue-500/10 text-blue-600 ring-blue-500/20"
  }
  return (
    <Card className="p-6 flex items-center gap-5 hover:scale-[1.03] transition-all duration-300 cursor-default group border-none shadow-lg shadow-slate-200/50 rounded-3xl bg-white/50 backdrop-blur-sm">
      <div className={cn("size-14 rounded-2xl flex items-center justify-center ring-1 shadow-inner group-hover:scale-110 transition-transform duration-500", colors[color])}>
        <Icon className="size-7" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
      </div>
    </Card>
  )
}
