"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

// Dùng relative URL khi ở client-side để tránh CORS và hardcoded host
const BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000")

type ReportIncidentFormProps = {
  treeIdParam: string
}

export function ReportIncidentForm({ treeIdParam }: ReportIncidentFormProps) {
  const [treeId, setTreeId] = useState(treeIdParam)
  const [reporterName, setReporterName] = useState("")
  const [reporterPhone, setReporterPhone] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!treeId) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("treeId", treeId)
      if (reporterName) fd.append("reporterName", reporterName)
      if (reporterPhone) fd.append("reporterPhone", reporterPhone)
      if (content) fd.append("content", content)
      const files = fileRef.current?.files
      if (files) for (const f of Array.from(files)) fd.append("images", f)

      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      const res = await fetch(`${BASE_URL}/api/tree-incidents/report-incident`, {
        method: "POST",
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => `HTTP ${res.status}`)
        throw new Error(errText)
      }
      setSuccess(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gửi báo cáo thất bại, vui lòng thử lại."
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-semibold text-[#007B22]">Báo cáo đã được gửi!</h2>
        <p className="text-sm text-muted-foreground">Cảm ơn bạn đã thông báo sự cố. Chúng tôi sẽ xử lý sớm nhất có thể.</p>
        <Link href="/" className="mt-2 rounded-lg bg-[#007B22] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#006400]">
          Quay lại bản đồ
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-[#007B22]"><ArrowLeftIcon className="size-5" /></Link>
        <h1 className="font-semibold text-[#007B22]">Báo cáo sự cố cây xanh</h1>
      </div>

      <form onSubmit={handleSubmit} className="container mx-auto px-4 py-6 max-w-lg flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Mã cây <span className="text-red-500">*</span></label>
          <input required type="number" min={1} value={treeId} onChange={(e) => setTreeId(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007B22]" placeholder="Nhập ID cây" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Họ tên</label>
            <input value={reporterName} onChange={(e) => setReporterName(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007B22]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Số điện thoại</label>
            <input type="tel" value={reporterPhone} onChange={(e) => setReporterPhone(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007B22]" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Mô tả sự cố</label>
          <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007B22] resize-none"
            placeholder="Mô tả chi tiết tình trạng sự cố..." />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Hình ảnh (tùy chọn)</label>
          <input type="file" accept="image/*" multiple ref={fileRef}
            className="rounded-lg border px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-[#007B22] file:text-white file:px-3 file:py-1 file:text-xs" />
        </div>
        <button type="submit" disabled={loading || !treeId}
          className="rounded-lg bg-[#007B22] px-4 py-3 text-sm font-semibold text-white hover:bg-[#006400] disabled:opacity-50 transition-colors">
          {loading ? "Đang gửi..." : "Gửi báo cáo"}
        </button>
      </form>
    </div>
  )
}
