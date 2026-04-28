import { type Metadata } from "next"
import { cookies } from "next/headers"
import { SectionCards, type DashboardStats } from "@/app/(dashboard)/components/section-cards"
import { ChartAreaInteractive } from "@/app/(dashboard)/components/chart-area-interactive"

export const metadata: Metadata = { title: "Phân tích" }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

async function fetchStats(): Promise<DashboardStats> {
  const token = (await cookies()).get("access_token")?.value
  const res = await fetch(`${BASE_URL}/api/reports/dashboard-stats`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  })
  if (!res.ok) return { totalTrees: 0, pendingIncidents: 0, completedWorksThisMonth: 0, pendingWorksThisMonth: 0 }
  return res.json()
}

export default async function AnalyticsPage() {
  const stats = await fetchStats()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Phân tích</h1>
        <p className="text-sm text-muted-foreground">Xu hướng và biểu đồ hoạt động cây xanh</p>
      </div>

      <SectionCards stats={stats} />

      <div className="px-0">
        <ChartAreaInteractive />
      </div>
    </div>
  )
}
