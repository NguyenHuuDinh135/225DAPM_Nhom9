"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { toast } from "@workspace/ui/components/sonner"
import { useRouter } from "next/navigation"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export function ApproveWorkItem({ workId }: { workId: number }) {
  const router = useRouter()
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)

  async function handle(action: "approve" | "reject") {
    const token = localStorage.getItem("access_token")
    const approverId = localStorage.getItem("user_id") ?? ""
    setLoading(action)
    try {
      const res = await fetch(`${BASE_URL}/api/work-items/${workId}/${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ approverId, feedback: feedback || null }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success(action === "approve" ? "Đã duyệt công việc" : "Đã từ chối công việc")
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message || "Thao tác thất bại")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <h3 className="font-medium text-sm">Xét duyệt công việc</h3>
      <Textarea
        placeholder="Phản hồi (bắt buộc khi từ chối)..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={loading !== null}
          onClick={() => handle("approve")}
        >
          {loading === "approve" ? "Đang duyệt..." : "Duyệt"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={loading !== null || !feedback.trim()}
          onClick={() => handle("reject")}
        >
          {loading === "reject" ? "Đang từ chối..." : "Từ chối"}
        </Button>
      </div>
    </div>
  )
}
