"use client"

import * as React from "react"
import { FullDashboardMap } from "@/app/(dashboard)/components/full-dashboard-map"

export default function ProfessionalMapPage() {
  return (
    <div className="h-[calc(100vh-var(--header-height))] w-full">
      <FullDashboardMap />
    </div>
  )
}
