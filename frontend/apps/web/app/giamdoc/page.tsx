"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ROLES } from "@/lib/roles"
import { DirectorDashboard } from "@/app/(dashboard)/components/director-dashboard"
import { apiClient } from "@/lib/api-client"

export default function DirectorHub() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>({
    totalTrees: 0,
    pendingIncidents: 0,
    completedWorksThisMonth: 0,
    pendingWorksThisMonth: 0
  })

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login")
      } else if (user.role !== ROLES.GiamDoc) {
        const target = user.role === ROLES.DoiTruong ? "/doitruong" : "/nhanvien";
        router.replace(target);
      }
    }
  }, [user, isLoading, router])

  const loadStats = async () => {
    try {
      const data = await apiClient.get<any>("/api/reports/dashboard-stats")
      if (data) setStats(data)
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error)
    }
  }

  useEffect(() => {
    if (user && user.role === ROLES.GiamDoc) loadStats()
  }, [user])

  if (isLoading || (user && user.role !== ROLES.GiamDoc)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    )
  }

  // Luôn trả về Dashboard, không đợi stats
  return <DirectorDashboard stats={stats} onRefresh={loadStats} />
}
