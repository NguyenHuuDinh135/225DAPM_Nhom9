"use client"

import { useEffect, useState } from "react"
import { Trees, Leaf, Droplets, Layers, MapPin, Route } from "lucide-react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

interface Stats { totalTrees: number; pendingIncidents: number; completedWorksThisMonth: number; pendingWorksThisMonth: number }

export function HomeStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch(`${BASE_URL}/api/reports/dashboard-stats`)
      .then((r) => r.ok ? r.json() : null)
      .then((d: Stats | null) => { if (d) setStats(d) })
      .catch(() => {})
  }, [])

  const totalTrees = stats?.totalTrees ?? "—"
  const summaryStats = [
    { icon: Leaf, value: stats?.completedWorksThisMonth ?? "—", label: "Hoàn thành tháng này" },
    { icon: Droplets, value: stats?.pendingWorksThisMonth ?? "—", label: "Công việc chờ" },
    { icon: Layers, value: stats?.pendingIncidents ?? "—", label: "Sự cố chờ xử lý" },
    { icon: MapPin, value: "—", label: "Khu vực" },
    { icon: Route, value: "—", label: "Tuyến" },
  ]

  return (
    <div className="bg-background border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-border">
          <div className="flex items-center gap-8 pr-8 pb-4 xl:pb-0">
            <div className="flex flex-col items-center justify-center min-w-[120px] text-green-700">
              <Trees className="h-14 w-14 mb-2" strokeWidth={1.5} />
              <span className="text-3xl font-bold text-foreground">{totalTrees.toLocaleString?.() ?? totalTrees}</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Cây xanh</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 xl:pt-0 pl-0 xl:pl-8 divide-x divide-border/50">
            {summaryStats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="flex flex-col items-center justify-center gap-2 pl-4 first:pl-0 xl:first:pl-4">
                  <div className="text-green-700"><Icon className="h-10 w-10" strokeWidth={1.5} /></div>
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
