"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { CaptainDashboard } from "@/app/(dashboard)/components/captain-dashboard"
import { SectionCardsSkeleton, type DashboardStats } from "@/app/(dashboard)/components/section-cards"
import { apiClient } from "@/lib/api-client"

export default function CaptainHub() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login")
      } else if (user.role !== ROLES.DoiTruong) {
        const target = user.role === ROLES.GiamDoc ? "/giamdoc" : "/nhanvien";
        router.replace(target);
      }
    }
  }, [user, isLoading, router])

  const loadStats = async () => {
    try {
      const data = await apiClient.get<DashboardStats>("/api/reports/dashboard-stats")
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role === ROLES.DoiTruong) loadStats()
  }, [user])

  if (isLoading || (user && user.role !== ROLES.DoiTruong)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    )
  }

  if (loading || !stats) {
    return <div className="p-6"><SectionCardsSkeleton /></div>
  }

  return <CaptainDashboard stats={stats} onRefresh={loadStats} />
}
