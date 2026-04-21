"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export default function ReportIncidentPage() {
  const router = useRouter()
  const [treeId, setTreeId] = useState("")
  const [reporterName, setReporterName] = useState("")
  const [reporterPhone, setReporterPhone] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!treeId) { toast.error("Vui lòng nhập mã cây"); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("treeId", treeId)
      if (reporterName) fd.append("reporterName", reporterName)
      if (reporterPhone) fd.append("reporterPhone", reporterPhone)
      if (content) fd.append("content", content)
      const files = fileRef.current?.files
      if (files) for (const f of Array.from(files)) fd.append("images", f)

      const res = await fetch(`${BASE_URL}/api/tree-incidents/report-incident`, { method: "POST", body: fd })
      if (!res.ok) throw new Error(await res.text())
      const id = await res.json()
      toast.success(`Báo cáo sự cố #${id} thành công`)
      router.push("/incidents")
    } catch {
      toast.error("Báo cáo thất bại, vui lòng thử lại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/incidents"><ArrowLeftIcon className="size-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Báo cáo sự cố</h1>
          <p className="text-sm text-muted-foreground">Ghi nhận sự cố cây xanh cần xử lý</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin sự cố</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="treeId">Mã cây <span className="text-destructive">*</span></Label>
              <Input id="treeId" type="number" min={1} placeholder="Nhập ID cây bị sự cố" value={treeId} onChange={(e) => setTreeId(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reporterName">Họ tên người báo</Label>
                <Input id="reporterName" value={reporterName} onChange={(e) => setReporterName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reporterPhone">Số điện thoại</Label>
                <Input id="reporterPhone" type="tel" value={reporterPhone} onChange={(e) => setReporterPhone(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content">Mô tả sự cố</Label>
              <Textarea id="content" placeholder="Mô tả chi tiết tình trạng..." rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="images">Hình ảnh (tùy chọn)</Label>
              <Input id="images" type="file" accept="image/*" multiple ref={fileRef} />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading}>{loading ? "Đang gửi..." : "Gửi báo cáo"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
