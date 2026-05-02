"use client"

import { useEffect, useState } from "react"
import { Trees, Leaf, Droplets, Layers, MapPin, Route } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Stats { totalTrees: number; pendingIncidents: number; completedWorksThisMonth: number; pendingWorksThisMonth: number; totalStreets: number; totalWards: number }

export function HomeStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    apiClient.get<Stats>("/api/reports/dashboard-stats")
      .then((d) => setStats(d))
      .catch((e) => console.warn("Public access might be restricted for stats", e))
  }, [])

  const totalTrees = stats?.totalTrees ?? "—"
  const summaryStats = [
    { icon: Leaf, value: stats?.completedWorksThisMonth ?? "—", label: "Hoàn thành tháng này" },
    { icon: Droplets, value: stats?.pendingWorksThisMonth ?? "—", label: "Công việc chờ" },
    { icon: Layers, value: stats?.pendingIncidents ?? "—", label: "Sự cố chờ xử lý" },
    { icon: MapPin, value: stats?.totalWards ?? "—", label: "Khu vực" },
    { icon: Route, value: stats?.totalStreets ?? "—", label: "Tuyến" },
  ]

  return (
    <div className="bg-background/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden p-6 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
        <div className="flex items-center gap-4 pr-0 lg:pr-8 lg:border-r border-border/50">
          <div className="p-4 bg-green-600 rounded-2xl text-white shadow-lg shadow-green-600/30">
            <Trees className="size-8" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-foreground tabular-nums tracking-tighter">
              {totalTrees.toLocaleString?.() ?? totalTrees}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cây xanh đô thị</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-6">
          {summaryStats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Icon className="size-4" strokeWidth={2} />
                  <span className="text-lg font-bold text-foreground tabular-nums leading-none">
                    {stat.value}
                  </span>
                </div>
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-tight leading-none">
                  {stat.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
