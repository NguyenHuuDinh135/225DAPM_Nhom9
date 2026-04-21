"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { apiClient } from "@/lib/api-client"

export function MaintenanceTriggerButton() {
  const [loading, setLoading] = useState(false)

  async function handleTrigger() {
    setLoading(true)
    try {
      await apiClient.post("/api/maintenance/trigger", {})
      toast.success("Đã kích hoạt kiểm tra bảo dưỡng thành công")
    } catch {
      toast.error("Kích hoạt thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleTrigger} disabled={loading} className="w-fit">
      {loading ? "Đang xử lý..." : "Kích hoạt bảo dưỡng"}
    </Button>
  )
}
