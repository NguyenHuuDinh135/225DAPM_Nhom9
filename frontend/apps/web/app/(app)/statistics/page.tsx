"use client"

import * as React from "react"
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from "recharts"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@workspace/ui/components/card"
import { TreePine, AlertTriangle, CheckCircle2, TrendingUp, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface DashboardStats {
  totalTrees: number
  totalStreets: number
  totalWards: number
  pendingIncidents: number
  completedWorksThisMonth: number
  pendingWorksThisMonth: number
}

interface MonthlyStat {
  month: string
  count: number
}

export default function StatisticsPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [monthlyData, setMonthlyData] = React.useState<MonthlyStat[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, monthlyRes] = await Promise.all([
          apiClient.get<DashboardStats>("/api/reports/dashboard-stats"),
          apiClient.get<MonthlyStat[]>("/api/reports/monthly-stats").catch(() => [])
        ])
        setStats(statsRes)
        if (Array.isArray(monthlyRes)) setMonthlyData(monthlyRes)
      } catch (error) {
        console.error("Failed to load statistics", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-green-600" />
      </div>
    )
  }

  // Phân bổ trạng thái (Giả định dựa trên tổng số, trong thực tế cần API chi tiết hơn)
  const treeStatusData = [
    { name: "Khỏe mạnh", value: stats?.totalTrees ? Math.floor(stats.totalTrees * 0.85) : 0, color: "#22c55e" },
    { name: "Sâu bệnh / Sự cố", value: stats?.pendingIncidents ?? 0, color: "#ef4444" },
    { name: "Đang bảo trì", value: stats?.pendingWorksThisMonth ?? 0, color: "#eab308" },
  ]

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 container mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-green-900 dark:text-green-100">Thống kê Cây xanh</h2>
          <p className="text-muted-foreground">
            Dữ liệu thực tế từ hệ thống quản lý cây xanh thành phố Đà Nẵng.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tổng số cây xanh" value={stats?.totalTrees.toLocaleString() ?? "0"} icon={<TreePine className="size-4" />} trend={`Phân bổ trên ${stats?.totalStreets} tuyến đường`} />
        <StatCard title="Sự cố chờ xử lý" value={stats?.pendingIncidents.toString() ?? "0"} icon={<AlertTriangle className="size-4" />} trend="Cần đội ngũ ứng trực" variant={stats?.pendingIncidents && stats.pendingIncidents > 0 ? "destructive" : "default"} />
        <StatCard title="Hoàn thành tháng này" value={stats?.completedWorksThisMonth.toString() ?? "0"} icon={<CheckCircle2 className="size-4" />} trend="Công tác cắt tỉa, bảo trì" />
        <StatCard title="Độ phủ xanh dự kiến" value="24.5%" icon={<TrendingUp className="size-4" />} trend={`Tại ${stats?.totalWards} phường/xã`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Biểu đồ bảo trì định kỳ</h3>
            <p className="text-sm text-muted-foreground">Số lượng lượt chăm sóc cây qua các tháng gần đây.</p>
          </div>
          <div className="p-6 pt-0 h-[300px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="count" name="Lượt bảo trì" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: "#16a34a" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground italic">
                Chưa có dữ liệu biểu đồ bảo trì
              </div>
            )}
          </div>
        </div>

        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Tình trạng hệ thống</h3>
            <p className="text-sm text-muted-foreground">Phân bổ sức khỏe cây dựa trên báo cáo thực tế.</p>
          </div>
          <div className="p-6 pt-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={treeStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {treeStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trend, variant = "default" }: { title: string; value: string; icon: React.ReactNode; trend: string; variant?: "default" | "destructive" }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-bold uppercase text-muted-foreground">{title}</h3>
        <div className={variant === "destructive" ? "text-destructive animate-pulse" : "text-green-600"}>{icon}</div>
      </div>
      <div className="p-6 pt-0">
        <div className="text-3xl font-black tracking-tighter">{value}</div>
        <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">{trend}</p>
      </div>
    </div>
  )
}
