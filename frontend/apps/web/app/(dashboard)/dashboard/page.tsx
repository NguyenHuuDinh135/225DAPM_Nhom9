import { Suspense } from "react"
import { cookies } from "next/headers"
import { ChartAreaInteractive } from "@/app/(dashboard)/components/chart-area-interactive"
import { DataTable } from "@/app/(dashboard)/components/data-table"
import { TaskMap } from "@/app/(dashboard)/components/task-map"
import { SectionCards, SectionCardsSkeleton, type DashboardStats } from "@/app/(dashboard)/components/section-cards"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

async function fetchStats(): Promise<DashboardStats> {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  const res = await fetch(`${BASE_URL}/api/reports/dashboard-stats`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error("Failed to fetch dashboard stats")

  const json = await res.json() as {
    totalTrees: number
    pendingIncidents: number
    completedWorksThisMonth: number
    pendingWorksThisMonth: number
  }

  return {
    totalTrees: json.totalTrees,
    pendingIncidents: json.pendingIncidents,
    completedWorksThisMonth: json.completedWorksThisMonth,
    pendingWorksThisMonth: json.pendingWorksThisMonth,
  }
}

async function StatsSection() {
  const stats = await fetchStats()
  return <SectionCards stats={stats} />
}

export default function Page() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          <Suspense fallback={<SectionCardsSkeleton />}>
            <StatsSection />
          </Suspense>

          <div className="px-4 lg:px-6">
            <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-border shadow-sm">
              <TaskMap />
            </div>
          </div>

          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>

          <DataTable data={[]} />

        </div>
      </div>
    </div>
  )
}
