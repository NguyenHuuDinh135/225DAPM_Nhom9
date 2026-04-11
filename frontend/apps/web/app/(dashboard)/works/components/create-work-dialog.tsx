"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { PlusIcon, XIcon } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import { type Work, type WorkStatus } from "../mock-data"

const WORK_TYPES = [
  { id: 1, name: "Cắt tỉa" },
  { id: 2, name: "Bón phân" },
  { id: 3, name: "Thay thế cây" },
  { id: 4, name: "Khảo sát" },
  { id: 5, name: "Xử lý sâu bệnh" },
]

const PLANS = [
  { id: 1, name: "Kế hoạch Q1 2025" },
  { id: 2, name: "Kế hoạch Q2 2025" },
  { id: 3, name: "Kế hoạch Q3 2025" },
]

interface Props {
  onCreated: (work: Work) => void
}

export function CreateWorkDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [workTypeId, setWorkTypeId] = useState("")
  const [planId, setPlanId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [staffCount, setStaffCount] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!workTypeId || !planId || !startDate || !endDate) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    const workType = WORK_TYPES.find((w) => w.id === Number(workTypeId))!
    const plan = PLANS.find((p) => p.id === Number(planId))!

    const newWork: Work = {
      id: Date.now(),
      workTypeId: Number(workTypeId),
      workTypeName: workType.name,
      planId: Number(planId),
      planName: plan.name,
      creatorId: "user-1",
      creatorName: "Nguyễn Văn A",
      startDate,
      endDate,
      status: "New" as WorkStatus,
      workUsers: [],
      workProgresses: [],
    }

    onCreated(newWork)
    toast.success("Đã tạo công việc mới")
    setOpen(false)
    setWorkTypeId("")
    setPlanId("")
    setStartDate("")
    setEndDate("")
    setStaffCount("")
  }

  if (!open) {
    return (
      <Button
        size="sm"
        className="w-fit bg-[#007B22] hover:bg-[#006400] text-white shrink-0"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="size-4" />
        Tạo công việc
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="font-semibold text-xl">Tạo công việc mới</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Điền thông tin để tạo công việc</p>
          </div>
          <Button variant="ghost" size="icon" className="size-9 rounded-full" onClick={() => setOpen(false)}>
            <XIcon className="size-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="workType" className="text-sm font-medium">Loại công việc</Label>
              <Select value={workTypeId} onValueChange={setWorkTypeId}>
                <SelectTrigger id="workType" className="h-10">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_TYPES.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="plan" className="text-sm font-medium">Kế hoạch</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger id="plan" className="h-10">
                  <SelectValue placeholder="Chọn kế hoạch" />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate" className="text-sm font-medium">Ngày bắt đầu</Label>
              <Input
                id="startDate"
                type="date"
                className="h-10"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate" className="text-sm font-medium">Ngày kết thúc</Label>
              <Input
                id="endDate"
                type="date"
                className="h-10"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="staffCount" className="text-sm font-medium">
              Số lượng nhân viên <span className="text-muted-foreground font-normal">(tùy chọn)</span>
            </Label>
            <Input
              id="staffCount"
              type="number"
              min={1}
              placeholder="Nhập số lượng nhân viên cần thiết"
              className="h-10"
              value={staffCount}
              onChange={(e) => setStaffCount(e.target.value)}
            />
          </div>

          <div className="flex gap-3 justify-end pt-1 border-t mt-1">
            <Button type="button" variant="outline" className="h-10 px-5" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="h-10 px-5 bg-[#007B22] hover:bg-[#006400] text-white">
              Tạo công việc
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
