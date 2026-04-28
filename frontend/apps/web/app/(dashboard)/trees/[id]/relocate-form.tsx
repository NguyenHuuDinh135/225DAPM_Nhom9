"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { toast } from "@workspace/ui/components/sonner"
import { MoveIcon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export function RelocateTreeForm({ treeId }: { treeId: number }) {
  const { user } = useAuth()
  const router = useRouter()
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [loading, setLoading] = useState(false)

  const canRelocate = user?.role === "Administrator" || user?.role === "Manager"
  if (!canRelocate) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)
    if (isNaN(latitude) || isNaN(longitude)) { toast.error("Tọa độ không hợp lệ"); return }
    const token = localStorage.getItem("access_token")
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/trees/${treeId}/relocate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id: treeId, latitude, longitude }),
      })
      if (!res.ok) throw new Error()
      toast.success("Đã di dời cây thành công")
      router.refresh()
    } catch {
      toast.error("Di dời thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MoveIcon className="size-4" /> Di dời cây
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lat">Vĩ độ mới</Label>
              <Input id="lat" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="16.0644" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lng">Kinh độ mới</Label>
              <Input id="lng" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="108.2149" />
            </div>
          </div>
          <Button type="submit" disabled={loading} size="sm" className="w-fit">
            {loading ? "Đang di dời..." : "Xác nhận di dời"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
