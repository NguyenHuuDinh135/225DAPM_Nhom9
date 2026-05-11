"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { DownloadIcon, TrendingUpIcon, TrendingDownIcon, ActivityIcon, DollarSignIcon } from "lucide-react"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MonthlyStatDto {
  month: string
  completedWorks: number
  newIncidents: number
}

interface DashboardStatsVm {
  totalTrees: number
  totalStreets: number
  totalWards: number
  pendingIncidents: number
  completedWorksThisMonth: number
  pendingWorksThisMonth: number
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function StrategicReportsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStatDto[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsVm | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login")
      } else if (user.role !== ROLES.GiamDoc) {
        router.replace("/")
      }
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && user.role === ROLES.GiamDoc) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [monthly, dashboard] = await Promise.all([
        apiClient.get<MonthlyStatDto[]>("/api/reports/monthly-stats?months=6"),
        apiClient.get<DashboardStatsVm>("/api/reports/dashboard-stats")
      ])
      setMonthlyStats(monthly)
      setDashboardStats(dashboard)
    } catch (error) {
      console.error("Failed to load reports data", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch("/api/reports/export", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `bao-cao-chien-luoc-${new Date().toISOString().split('T')[0]}.xlsx`
        a.click()
      }
    } catch (error) {
      console.error("Export failed", error)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    )
  }

  // Tính toán dữ liệu cho các biểu đồ
  const greenCoverageData = dashboardStats ? [
    { name: "Đường phố có cây", value: dashboardStats.totalStreets, fill: COLORS[0] },
    { name: "Phường/Xã", value: dashboardStats.totalWards, fill: COLORS[1] },
  ] : []

  const incidentResolutionData = monthlyStats.map(stat => ({
    month: stat.month,
    "Sự cố mới": stat.newIncidents,
    "Công việc hoàn thành": stat.completedWorks
  }))

  const costEstimateData = monthlyStats.map(stat => ({
    month: stat.month,
    "Chi phí ước tính (triệu VNĐ)": stat.completedWorks * 15 + stat.newIncidents * 5
  }))

  const incidentTrend = monthlyStats.length >= 2 
    ? ((monthlyStats[monthlyStats.length - 1].newIncidents - monthlyStats[monthlyStats.length - 2].newIncidents) / (monthlyStats[monthlyStats.length - 2].newIncidents || 1)) * 100
    : 0

  const workCompletionTrend = monthlyStats.length >= 2
    ? ((monthlyStats[monthlyStats.length - 1].completedWorks - monthlyStats[monthlyStats.length - 2].completedWorks) / (monthlyStats[monthlyStats.length - 2].completedWorks || 1)) * 100
    : 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Báo cáo chiến lược</h1>
          <p className="text-sm text-slate-600 mt-1">Tổng hợp số liệu, phân tích hiệu suất và định hướng quản lý</p>
        </div>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
          <DownloadIcon className="size-4 mr-2" />
          Xuất báo cáo (PDF)
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="forecast">Dự báo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Mật độ phủ xanh</CardTitle>
                <ActivityIcon className="size-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.totalTrees || 0} cây</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Phân bố trên {dashboardStats?.totalStreets || 0} tuyến đường
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Xu hướng sự cố</CardTitle>
                {incidentTrend >= 0 ? (
                  <TrendingUpIcon className="size-4 text-red-600" />
                ) : (
                  <TrendingDownIcon className="size-4 text-green-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {incidentTrend >= 0 ? '+' : ''}{incidentTrend.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">So với tháng trước</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Hiệu suất xử lý</CardTitle>
                {workCompletionTrend >= 0 ? (
                  <TrendingUpIcon className="size-4 text-green-600" />
                ) : (
                  <TrendingDownIcon className="size-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workCompletionTrend >= 0 ? '+' : ''}{workCompletionTrend.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Công việc hoàn thành</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Báo cáo Mật độ phủ xanh</CardTitle>
              <CardDescription>Phân tích tỷ lệ cây xanh theo từng quận/huyện</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={greenCoverageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {greenCoverageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất xử lý sự cố</CardTitle>
              <CardDescription>Lượng sự cố được giải quyết theo thời gian (6 tháng gần nhất)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={incidentResolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Sự cố mới" fill={COLORS[3]} />
                  <Bar dataKey="Công việc hoàn thành" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tỷ lệ hoàn thành</CardTitle>
                <CardDescription>Tháng hiện tại</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">
                  {dashboardStats ? 
                    Math.round((dashboardStats.completedWorksThisMonth / (dashboardStats.completedWorksThisMonth + dashboardStats.pendingWorksThisMonth || 1)) * 100) 
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {dashboardStats?.completedWorksThisMonth || 0} / {(dashboardStats?.completedWorksThisMonth || 0) + (dashboardStats?.pendingWorksThisMonth || 0)} công việc
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sự cố đang chờ</CardTitle>
                <CardDescription>Cần xử lý ưu tiên</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-orange-600">
                  {dashboardStats?.pendingIncidents || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Sự cố chưa được giải quyết
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dự báo chi phí bảo trì</CardTitle>
              <CardDescription>Ước tính ngân sách cần thiết dựa trên lịch sử và xu hướng</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={costEstimateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Chi phí ước tính (triệu VNĐ)" 
                    stroke={COLORS[4]} 
                    strokeWidth={2}
                    dot={{ fill: COLORS[4], r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Chi phí trung bình/tháng</CardTitle>
                <DollarSignIcon className="size-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {costEstimateData.length > 0 
                    ? Math.round(costEstimateData.reduce((sum, d) => sum + d["Chi phí ước tính (triệu VNĐ)"], 0) / costEstimateData.length)
                    : 0} triệu
                </div>
                <p className="text-xs text-muted-foreground mt-1">6 tháng gần nhất</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Dự báo tháng tới</CardTitle>
                <TrendingUpIcon className="size-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {costEstimateData.length > 0 
                    ? Math.round(costEstimateData[costEstimateData.length - 1]["Chi phí ước tính (triệu VNĐ)"] * 1.1)
                    : 0} triệu
                </div>
                <p className="text-xs text-muted-foreground mt-1">Ước tính tăng 10%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ngân sách khuyến nghị</CardTitle>
                <DollarSignIcon className="size-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {costEstimateData.length > 0 
                    ? Math.round(costEstimateData[costEstimateData.length - 1]["Chi phí ước tính (triệu VNĐ)"] * 1.25)
                    : 0} triệu
                </div>
                <p className="text-xs text-muted-foreground mt-1">Dự phòng 25%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
