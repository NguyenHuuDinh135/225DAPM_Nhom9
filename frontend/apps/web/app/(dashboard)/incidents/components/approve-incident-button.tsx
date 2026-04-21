"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { CheckCircleIcon } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"

export function ApproveIncidentButton({ incidentId }: { incidentId: number }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  if (!user?.role || !["Manager", "Administrator", "Admin"].includes(user.role)) return null

  async function handleApprove() {
    if (!confirm("Xác nhận duyệt sự cố này?")) return
    setLoading(true)
    try {
      await apiClient.put(`/api/tree-incidents/${incidentId}/approve`, {
        id: incidentId,
        approverId: user!.id,
      })
      toast.success("Đã duyệt sự cố")
    } catch {
      toast.error("Duyệt thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" onClick={handleApprove} disabled={loading}>
      <CheckCircleIcon className="mr-1 size-4" />
      {loading ? "Đang duyệt..." : "Duyệt sự cố"}
    </Button>
  )
}
