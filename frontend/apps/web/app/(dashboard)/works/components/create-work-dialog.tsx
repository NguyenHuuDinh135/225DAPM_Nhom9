"use client"

import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { PlusIcon, XIcon, CalendarIcon, UserIcon, BriefcaseIcon, ClipboardListIcon } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import type { WorkItem } from "../page"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

interface Plan { id: number; name: string | null }
interface WorkType { id: number; name: string | null }
interface Employee { id: string; fullName: string | null; email: string | null }
interface Props { onCreated: (work: WorkItem) => void }

export function CreateWorkDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [workTypeId, setWorkTypeId] = useState("")
  const [planId, setPlanId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const token = localStorage.getItem("access_token")
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    // Load plans
    fetch(`${BASE_URL}/api/planning`, { headers })
      .then((r) => r.ok ? r.json() : [])
      .then((data: Plan[]) => setPlans(data))
      .catch(() => {})
    
    // Load work types
    fetch(`${BASE_URL}/api/lookups/work-types`, { headers })
      .then((r) => r.ok ? r.json() : [])
      .then((data: WorkType[]) => setWorkTypes(data))
      .catch(() => {})
    
    // Load employees
    fetch(`${BASE_URL}/api/employees`, { headers })
      .then((r) => r.ok ? r.json() : { employees: [] })
      .then((data: { employees: Employee[] }) => setEmployees(data.employees ?? []))
      .catch(() => {})
  }, [open])

  function toggleEmployee(employeeId: string) {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!workTypeId || !planId) { 
      toast.error("Vui lòng chọn loại công tác và kế hoạch")
      return 
    }
    if (!startDate || !endDate) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc")
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
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        },
        body: JSON.stringify({ 
          workTypeId: Number(workTypeId), 
          planId: Number(planId), 
          creatorId, 
          startDate, 
          endDate,
          description: description.trim() || null
        }),
      })
      
      if (!res.ok) throw new Error("Tạo công tác thất bại")
      
      const newWork = await res.json()
      
      // Assign employees if selected
      if (selectedEmployees.length > 0 && newWork.id) {
        for (const employeeId of selectedEmployees) {
          try {
            await fetch(`${BASE_URL}/api/work-items/${newWork.id}/assign-user`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json", 
                ...(token ? { Authorization: `Bearer ${token}` } : {}) 
              },
              body: JSON.stringify({ 
                workId: newWork.id, 
                userId: employeeId, 
                role: null 
              }),
            })
          } catch (err) {
            console.error("Failed to assign employee:", employeeId, err)
          }
        }
      }
      
      const workType = workTypes.find((w) => w.id === Number(workTypeId))
      const plan = plans.find((p) => p.id === Number(planId))!
      
      onCreated({ 
        id: newWork.id || Date.now(), 
        workTypeId: Number(workTypeId), 
        workTypeName: workType?.name ?? null, 
        planId: Number(planId), 
        planName: plan.name, 
        creatorId, 
        startDate, 
        endDate, 
        status: "New", 
        statusName: "New" 
      })
      
      toast.success(`Đã tạo công tác${selectedEmployees.length > 0 ? ` và phân công ${selectedEmployees.length} nhân viên` : ''}`)
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error((err as Error).message || "Tạo công tác thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setWorkTypeId("")
    setPlanId("")
    setStartDate("")
    setEndDate("")
    setDescription("")
    setSelectedEmployees([])
  }

  if (!open) {
    return (
      <Button size="sm" className="w-fit bg-[#007B22] hover:bg-[#006400] text-white shrink-0" onClick={() => setOpen(true)}>
        <PlusIcon className="size-4" /> Tạo công tác
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="font-semibold text-xl">Phân công công việc</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Tạo công tác mới và phân công nhân viên</p>
          </div>
          <Button variant="ghost" size="icon" className="size-9 rounded-full" onClick={() => setOpen(false)}>
            <XIcon className="size-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Thông tin công tác */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <BriefcaseIcon className="size-4" />
              <span>Thông tin công tác</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan" className="text-sm font-medium">
                  Kế hoạch <span className="text-destructive">*</span>
                </Label>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger id="plan" className="h-10">
                    <SelectValue placeholder="Chọn kế hoạch..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Không có kế hoạch nào
                      </div>
                    ) : (
                      plans.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="workType" className="text-sm font-medium">
                  Loại công việc <span className="text-destructive">*</span>
                </Label>
                <Select value={workTypeId} onValueChange={setWorkTypeId}>
                  <SelectTrigger id="workType" className="h-10">
                    <SelectValue placeholder="Chọn loại công việc..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5" />
                  Ngày bắt đầu <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  className="h-10" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="endDate" className="text-sm font-medium flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5" />
                  Ngày kết thúc <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  className="h-10" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả công việc
              </Label>
              <Textarea 
                id="description"
                placeholder="Nhập mô tả chi tiết về công việc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Phân công nhân viên */}
          <div className="space-y-4 border-t pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <UserIcon className="size-4" />
                <span>Nhân viên thực hiện</span>
              </div>
              {selectedEmployees.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  Đã chọn {selectedEmployees.length} nhân viên
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {employees.length === 0 ? (
                <div className="col-span-2 text-center text-sm text-muted-foreground py-8">
                  Không có nhân viên nào
                </div>
              ) : (
                employees.map((emp) => (
                  <label
                    key={emp.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedEmployees.includes(emp.id)
                        ? 'bg-primary/5 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                      className="size-4 rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {emp.fullName || emp.email || 'Không rõ'}
                      </div>
                      {emp.email && emp.fullName && (
                        <div className="text-xs text-muted-foreground truncate">
                          {emp.email}
                        </div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              Bạn có thể chọn nhiều nhân viên để phân công cùng lúc. Có thể bỏ qua và phân công sau.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-1 border-t">
            <Button 
              type="button" 
              variant="outline" 
              className="h-10 px-5" 
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || !workTypeId || !planId || !startDate || !endDate} 
              className="h-10 px-5 bg-[#007B22] hover:bg-[#006400] text-white"
            >
              {submitting ? "Đang tạo..." : "Tạo công tác"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
