"use client"

import { use, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { ArrowLeftIcon, SendIcon } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"

interface ProgressEntry { id: number; updaterId: string; note: string | null; updatedDate: string | null; images: string[] }
interface WorkDetail { id: number; workTypeName: string | null; planName: string | null; progresses: ProgressEntry[] }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export default function ProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [work, setWork] = useState<WorkDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [note, setNote] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  function loadWork() {
    const token = localStorage.getItem("access_token")
    fetch(`${BASE_URL}/api/work-items/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: WorkDetail) => setWork(data))
      .catch(() => toast.error("Không thể tải thông tin công tác"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadWork() }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const token = localStorage.getItem("access_token")
    const userId = localStorage.getItem("user_id") ?? ""
    const fd = new FormData()
    fd.append("note", note)
    fd.append("updaterId", userId)
    const files = fileRef.current?.files
    if (files) for (const f of Array.from(files)) fd.append("images", f)
    setSubmitting(true)
    try {
      const res = await fetch(`${BASE_URL}/api/work-items/${id}/report-progress`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      if (!res.ok) throw new Error()
      toast.success("Đã cập nhật tiến độ")
      setNote("")
      if (fileRef.current) fileRef.current.value = ""
      loadWork()
    } catch {
      toast.error("Cập nhật thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Đang tải...</div>
  if (!work) return <div className="p-6 text-muted-foreground">Không tìm thấy công tác.</div>

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-w-0">
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/works"><ArrowLeftIcon className="size-4" /></Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold md:text-2xl truncate">Cập nhật tiến độ</h1>
          <p className="text-sm text-muted-foreground truncate">{work.workTypeName} — {work.planName}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit} className="rounded-lg border p-4 flex flex-col gap-4 h-fit">
          <h2 className="font-medium">Thêm cập nhật mới</h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea id="note" placeholder="Mô tả công việc đã thực hiện..." value={note} onChange={(e) => setNote(e.target.value)} rows={4} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="images">Ảnh đính kèm</Label>
            <input id="images" ref={fileRef} type="file" accept="image/*" multiple
              className="text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm" />
          </div>
          <Button type="submit" disabled={submitting} className="bg-[#007B22] hover:bg-[#006400] text-white">
            <SendIcon className="size-4" />
            {submitting ? "Đang gửi..." : "Cập nhật"}
          </Button>
        </form>

        <div className="rounded-lg border p-4 flex flex-col gap-3 overflow-y-auto max-h-[600px]">
          <h2 className="font-medium">Lịch sử cập nhật</h2>
          {work.progresses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Chưa có cập nhật nào.</p>
          ) : (
            <div className="flex flex-col">
              {[...work.progresses].reverse().map((p, i, arr) => (
                <div key={p.id} className="flex gap-3">
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <div className="size-2.5 rounded-full bg-[#007B22]" />
                    {i < arr.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-4 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{p.updaterId}</span>
                      {p.updatedDate && <span className="text-muted-foreground text-xs">· {new Date(p.updatedDate).toLocaleDateString("vi-VN")}</span>}
                    </div>
                    {p.note && <p className="text-sm text-muted-foreground mt-0.5 break-words">{p.note}</p>}
                    {p.images.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.images.map((src, idx) => (
                          <a key={idx} href={src} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Ảnh {idx + 1}</a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
