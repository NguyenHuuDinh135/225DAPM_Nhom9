"use client"

import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@workspace/ui/components/select"
import { PlusIcon, XIcon } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import type { WorkItem } from "../page"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

const WORK_TYPES = [
  { id: 1, name: "Cắt tỉa" },
  { id: 2, name: "Bón phân" },
  { id: 3, name: "Thay thế cây" },
  { id: 4, name: "Khảo sát" },
  { id: 5, name: "Xử lý sâu bệnh" },
]

interface Plan { id: number; name: string | null }

interface Props {
  onCreated: (work: WorkItem) => void
}

export function CreateWorkDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [workTypeId, setWorkTypeId] = useState("")
  const [planId, setPlanId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const token = localStorage.getItem("access_token")
    fetch(`${BASE_URL}/api/planning`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data: Plan[]) => setPlans(data))
      .catch(() => {})
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!workTypeId || !planId) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }
    const token = localStorage.getItem("access_token")
    const creatorId = localStorage.getItem("user_id") ?? ""

    setSubmitting(true)
    try {
      const res = await fetch(`${BASE_URL}/api/work-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          workTypeId: Number(workTypeId),
          planId: Number(planId),
          creatorId,
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      })
      if (!res.ok) throw new Error()

      const workType = WORK_TYPES.find((w) => w.id === Number(workTypeId))!
      const plan = plans.find((p) => p.id === Number(planId))!
      const newWork: WorkItem = {
        id: Date.now(),
        workTypeId: Number(workTypeId),
        workTypeName: workType.name,
        planId: Number(planId),
        planName: plan.name,
        creatorId,
        startDate: startDate || null,
        endDate: endDate || null,
        status: "New",
        statusName: "New",
      }
      onCreated(newWork)
      toast.success("Đã tạo công việc mới")
      setOpen(false)
      setWorkTypeId(""); setPlanId(""); setStartDate(""); setEndDate("")
    } catch {
      toast.error("Tạo công việc thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <Button size="sm" className="w-fit bg-[#007B22] hover:bg-[#006400] text-white shrink-0" onClick={() => setOpen(true)}>
        <PlusIcon className="size-4" />
        Tạo công việc
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="font-semibold text-xl">Tạo công việc mới</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Điền thông tin để tạo công việc</p>
          </div>
          <Button variant="ghost" size="icon" className="size-9 rounded-full" onClick={() => setOpen(false)}>
            <XIcon className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="workType" className="text-sm font-medium">Loại công việc</Label>
              <Select value={workTypeId} onValueChange={setWorkTypeId}>
                <SelectTrigger id="workType" className="h-10"><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                <SelectContent>
                  {WORK_TYPES.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan" className="text-sm font-medium">Kế hoạch</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger id="plan" className="h-10"><SelectValue placeholder="Chọn kế hoạch" /></SelectTrigger>
                <SelectContent>
                  {plans.length === 0
                    ? <SelectItem value="-" disabled>Không có kế hoạch</SelectItem>
                    : plans.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate" className="text-sm font-medium">Ngày bắt đầu</Label>
              <Input id="startDate" type="date" className="h-10" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate" className="text-sm font-medium">Ngày kết thúc</Label>
              <Input id="endDate" type="date" className="h-10" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-1 border-t mt-1">
            <Button type="button" variant="outline" className="h-10 px-5" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={submitting} className="h-10 px-5 bg-[#007B22] hover:bg-[#006400] text-white">
              {submitting ? "Đang tạo..." : "Tạo công việc"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
