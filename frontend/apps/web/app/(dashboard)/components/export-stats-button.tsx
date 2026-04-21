"use client"

import { useState } from "react"
import { DownloadIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export function ExportStatsButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    const token = localStorage.getItem("access_token")
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/reports/export-dashboard-stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error(await res.text())

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const disposition = res.headers.get("content-disposition")
      const filename = disposition?.match(/filename="?([^"]+)"?/)?.[1] ?? "dashboard-stats.xlsx"
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error((err as Error).message || "Xuất báo cáo thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      <DownloadIcon className="mr-1 size-4" />
      {loading ? "Đang xuất..." : "Xuất báo cáo"}
    </Button>
  )
}
