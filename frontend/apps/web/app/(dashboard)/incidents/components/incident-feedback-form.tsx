"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"
import { toast } from "@workspace/ui/components/sonner"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export function IncidentFeedbackForm({ incidentId }: { incidentId: number }) {
  const [feedback, setFeedback] = useState("")
  const [isResolved, setIsResolved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!feedback.trim()) { toast.error("Vui lòng nhập nội dung phản hồi"); return }
    const token = localStorage.getItem("access_token")
    const approverId = localStorage.getItem("user_id") ?? ""
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/tree-incidents/${incidentId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ feedback: feedback.trim(), approverId, isResolved }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Đã gửi phản hồi")
      setFeedback("")
      setIsResolved(false)
    } catch (err) {
      toast.error((err as Error).message || "Gửi phản hồi thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Phản hồi cho người báo cáo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Textarea
            placeholder="Nhập nội dung phản hồi..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
          <div className="flex items-center gap-2">
            <Checkbox id="isResolved" checked={isResolved} onCheckedChange={(v) => setIsResolved(!!v)} />
            <Label htmlFor="isResolved" className="text-sm cursor-pointer">Đánh dấu đã giải quyết</Label>
          </div>
          <Button type="submit" disabled={loading} className="self-end">
            {loading ? "Đang gửi..." : "Gửi phản hồi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
