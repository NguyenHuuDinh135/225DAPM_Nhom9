"use client"

import { use, useState } from "react"
import Link from "next/link"
import { mockWorks } from "../../mock-data"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { ArrowLeftIcon, SendIcon } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"

interface ProgressEntry {
  id: number
  updaterName: string
  percentage: number
  note: string
  updatedDate: string
}

export default function ProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const work = mockWorks.find((w) => w.id === Number(id))

  const [progresses, setProgresses] = useState<ProgressEntry[]>(
    work?.workProgresses.map((p) => ({ ...p })) ?? []
  )
  const [percentage, setPercentage] = useState("")
  const [note, setNote] = useState("")

  if (!work) return <div className="p-6 text-muted-foreground">Không tìm thấy công việc.</div>

  const latestPercentage = progresses.length > 0 ? progresses[progresses.length - 1]!.percentage : 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const pct = Number(percentage)
    if (!percentage || isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Tiến độ phải từ 0 đến 100")
      return
    }
    setProgresses((prev) => [
      ...prev,
      {
        id: Date.now(),
        updaterName: "Bạn",
        percentage: pct,
        note,
        updatedDate: new Date().toISOString().split("T")[0],
      },
    ])
    setPercentage("")
    setNote("")
    toast.success("Đã cập nhật tiến độ")
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/works"><ArrowLeftIcon className="size-4" /></Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold md:text-2xl truncate">Cập nhật tiến độ</h1>
          <p className="text-sm text-muted-foreground truncate">{work.workTypeName} — {work.planName}</p>
        </div>
      </div>

      {/* Layout: stack trên mobile, 2 cột trên lg */}
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* Cột trái */}
        <div className="flex flex-col gap-4">
          {/* Progress bar */}
          <div className="rounded-lg border p-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Tiến độ hiện tại</span>
              <span className="text-[#007B22] font-semibold">{latestPercentage}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-[#007B22] transition-all duration-500"
                style={{ width: `${latestPercentage}%` }}
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-lg border p-4 flex flex-col gap-4">
            <h2 className="font-medium">Thêm cập nhật mới</h2>
            <div className="flex flex-col gap-2">
              <Label htmlFor="percentage">Tiến độ (%)</Label>
              <Input
                id="percentage"
                type="number"
                min={0}
                max={100}
                placeholder="0 - 100"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                placeholder="Mô tả công việc đã thực hiện..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
              />
            </div>
            <Button type="submit" className="bg-[#007B22] hover:bg-[#006400] text-white">
              <SendIcon className="size-4" />
              Cập nhật
            </Button>
          </form>
        </div>

        {/* Cột phải: timeline */}
        <div className="rounded-lg border p-4 flex flex-col gap-3 overflow-y-auto max-h-[600px]">
          <h2 className="font-medium">Lịch sử cập nhật</h2>
          {progresses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Chưa có cập nhật nào.</p>
          ) : (
            <div className="flex flex-col">
              {[...progresses].reverse().map((p, i, arr) => (
                <div key={p.id} className="flex gap-3">
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <div className="size-2.5 rounded-full bg-[#007B22]" />
                    {i < arr.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 text-sm flex-wrap">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-medium truncate">{p.updaterName}</span>
                        <span className="text-muted-foreground shrink-0 text-xs">· {p.updatedDate}</span>
                      </div>
                      <span className="font-semibold text-[#007B22] shrink-0">{p.percentage}%</span>
                    </div>
                    {p.note && (
                      <p className="text-sm text-muted-foreground mt-0.5 break-words">{p.note}</p>
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
