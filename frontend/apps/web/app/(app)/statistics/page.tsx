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
import { TreePine, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react"

// Mock data for initial design
const treeStatusData = [
  { name: "Khỏe mạnh", value: 65, color: "#22c55e" },
  { name: "Cần chăm sóc", value: 20, color: "#eab308" },
  { name: "Sâu bệnh", value: 10, color: "#ef4444" },
  { name: "Mới trồng", value: 5, color: "#3b82f6" },
]

const speciesData = [
  { name: "Sao đen", count: 120 },
  { name: "Dầu rái", count: 98 },
  { name: "Xà cừ", count: 86 },
  { name: "Bằng lăng", count: 75 },
  { name: "Phượng vĩ", count: 64 },
]

const maintenanceData = [
  { month: "Jan", count: 45 },
  { month: "Feb", count: 52 },
  { month: "Mar", count: 48 },
  { month: "Apr", count: 61 },
  { month: "May", count: 55 },
  { month: "Jun", count: 67 },
]

export default function StatisticsPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6 container mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Thống kê Cây xanh</h2>
          <p className="text-muted-foreground">
            Tổng quan về hệ thống cây xanh đô thị thành phố Đà Nẵng.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tổng số cây" value="4,250" icon={<TreePine className="size-4" />} trend="+12% so với năm ngoái" />
        <StatCard title="Sự cố đang xử lý" value="12" icon={<AlertTriangle className="size-4" />} trend="-5% so với tháng trước" variant="destructive" />
        <StatCard title="Đã bảo trì (tháng)" value="156" icon={<CheckCircle2 className="size-4" />} trend="+18% so với tháng trước" />
        <StatCard title="Độ phủ xanh" value="28%" icon={<TrendingUp className="size-4" />} trend="+2.1% mục tiêu 2026" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Hoạt động bảo trì</h3>
            <p className="text-sm text-muted-foreground">Số lượng lượt chăm sóc cây theo từng tháng.</p>
          </div>
          <div className="p-6 pt-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maintenanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Tình trạng sức khỏe</h3>
            <p className="text-sm text-muted-foreground">Phân bổ trạng thái của toàn bộ hệ thống cây.</p>
          </div>
          <div className="p-6 pt-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={treeStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {treeStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-7 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Phân bổ loài cây</h3>
            <p className="text-sm text-muted-foreground">Các loài cây phổ biến nhất trong khu vực đô thị.</p>
          </div>
          <div className="p-6 pt-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speciesData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trend, variant = "default" }: { title: string; value: string; icon: React.ReactNode; trend: string; variant?: "default" | "destructive" }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        <div className={variant === "destructive" ? "text-destructive" : "text-muted-foreground"}>{icon}</div>
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{trend}</p>
      </div>
    </div>
  )
}
