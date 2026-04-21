"use client"

import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { apiClient } from "@/lib/api-client"

interface Employee { id: string; fullName: string | null; email: string | null; role: string | null }
interface Plan { id: number; name: string | null }
interface WorkType { id: number; name: string | null }

export default function AssignTaskPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    workTypeId: "",
    planId: "",
    creatorId: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    apiClient.get<{ employees: Employee[] }>("/api/employees")
      .then((r) => setEmployees(r.employees.filter((e) => e.role === "Employee")))
      .catch(() => {})
    apiClient.get<Plan[]>("/api/planning")
      .then(setPlans)
      .catch(() => {})
    // WorkTypes không có endpoint riêng — lấy từ work-items để suy ra
  }, [])

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.workTypeId || !form.planId || !form.creatorId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }
    setLoading(true)
    try {
      await apiClient.post("/api/work-items", {
        workTypeId: Number(form.workTypeId),
        planId: Number(form.planId),
        creatorId: form.creatorId,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      })
      toast.success("Phân công công việc thành công")
      setForm({ workTypeId: "", planId: "", creatorId: "", startDate: "", endDate: "" })
    } catch {
      toast.error("Phân công thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold">Phân công công việc</h1>
        <p className="text-sm text-muted-foreground">Giao công việc cho nhân viên cây xanh</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin phân công</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="planId">Kế hoạch <span className="text-destructive">*</span></Label>
              <Select value={form.planId} onValueChange={(v) => set("planId", v)}>
                <SelectTrigger id="planId"><SelectValue placeholder="Chọn kế hoạch..." /></SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name ?? `Kế hoạch #${p.id}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="workTypeId">Loại công việc (ID) <span className="text-destructive">*</span></Label>
              <Input
                id="workTypeId"
                type="number"
                min={1}
                placeholder="Nhập ID loại công việc"
                value={form.workTypeId}
                onChange={(e) => set("workTypeId", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="creatorId">Nhân viên thực hiện <span className="text-destructive">*</span></Label>
              <Select value={form.creatorId} onValueChange={(v) => set("creatorId", v)}>
                <SelectTrigger id="creatorId"><SelectValue placeholder="Chọn nhân viên..." /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.fullName ?? e.email ?? e.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input id="startDate" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input id="endDate" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang phân công..." : "Phân công"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
