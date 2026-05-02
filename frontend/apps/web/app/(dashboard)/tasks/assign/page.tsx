"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "@workspace/ui/components/sonner"
import { ROLES } from "@/lib/roles"
import { apiClient } from "@/lib/api-client"
import { ArrowLeftIcon, CalendarIcon, UserIcon, BriefcaseIcon, ClipboardListIcon, CheckCircle2Icon } from "lucide-react"
import Link from "next/link"

interface Employee { id: string; fullName: string | null; email: string | null; role: string | null }
interface Plan { id: number; name: string | null; startDate: string | null; endDate: string | null }
interface WorkType { id: number; name: string | null }

export default function AssignTaskPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])

  const [form, setForm] = useState({
    workTypeId: "",
    planId: "",
    startDate: "",
    endDate: "",
    description: "",
  })

  useEffect(() => {
    // Load employees
    apiClient.get<{ employees: Employee[] }>("/api/employees")
      .then((r) => setEmployees(r.employees.filter((e) => e.role === ROLES.NhanVien)))
      .catch(() => {})
    
    // Load plans
    apiClient.get<Plan[]>("/api/planning")
      .then(setPlans)
      .catch(() => {})
    
    // Load work types
    apiClient.get<WorkType[]>("/api/lookups/work-types")
      .then(setWorkTypes)
      .catch(() => {})
  }, [])

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleEmployee(employeeId: string) {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const selectedPlan = plans.find(p => p.id === Number(form.planId))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!form.workTypeId || !form.planId) {
      toast.error("Vui lòng chọn loại công việc và kế hoạch")
      return
    }
    
    if (selectedEmployees.length === 0) {
      toast.error("Vui lòng chọn ít nhất một nhân viên")
      return
    }

    if (!form.startDate || !form.endDate) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc")
      return
    }

    setLoading(true)
    const creatorId = localStorage.getItem("user_id") ?? ""
    
    try {
      // Create work item
      const workRes = await apiClient.post<{ id: number }>("/api/work-items", {
        workTypeId: Number(form.workTypeId),
        planId: Number(form.planId),
        creatorId,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description.trim() || null,
      })

      // Assign employees
      if (workRes.id) {
        for (const employeeId of selectedEmployees) {
          try {
            await apiClient.post(`/api/work-items/${workRes.id}/assign-user`, {
              workId: workRes.id,
              userId: employeeId,
              role: null,
            })
          } catch (err) {
            console.error("Failed to assign employee:", employeeId, err)
          }
        }
      }

      toast.success(`Đã phân công công việc cho ${selectedEmployees.length} nhân viên`)
      
      // Reset form
      setForm({ workTypeId: "", planId: "", startDate: "", endDate: "", description: "" })
      setSelectedEmployees([])
      
      // Redirect to works page
      setTimeout(() => router.push("/works"), 1000)
    } catch (err) {
      toast.error("Phân công thất bại")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/works">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Phân công công việc</h1>
          <p className="text-sm text-muted-foreground">Tạo công việc mới và giao cho nhân viên thực hiện</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Row 1 - Work Information (Horizontal) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="size-5 text-primary" />
              <CardTitle>Thông tin công việc</CardTitle>
            </div>
            <CardDescription>Chọn kế hoạch và loại công việc cần thực hiện</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="planId">
                  Kế hoạch <span className="text-destructive">*</span>
                </Label>
                <Select value={form.planId} onValueChange={(v) => set("planId", v)}>
                  <SelectTrigger id="planId">
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
                          {p.name ?? `Kế hoạch #${p.id}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedPlan && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="size-3" />
                    {selectedPlan.startDate && selectedPlan.endDate && (
                      <>
                        {new Date(selectedPlan.startDate).toLocaleDateString('vi-VN')} - {new Date(selectedPlan.endDate).toLocaleDateString('vi-VN')}
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="workTypeId">
                  Loại công việc <span className="text-destructive">*</span>
                </Label>
                <Select value={form.workTypeId} onValueChange={(v) => set("workTypeId", v)}>
                  <SelectTrigger id="workTypeId">
                    <SelectValue placeholder="Chọn loại công việc..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Không có loại công việc nào
                      </div>
                    ) : (
                      workTypes.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="startDate" className="flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5" />
                  Ngày bắt đầu <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={form.startDate} 
                  onChange={(e) => set("startDate", e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="endDate" className="flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5" />
                  Ngày kết thúc <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={form.endDate} 
                  onChange={(e) => set("endDate", e.target.value)}
                  min={form.startDate}
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="description">Mô tả công việc</Label>
                <Textarea
                  id="description"
                  placeholder="Nhập mô tả chi tiết về công việc cần thực hiện..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Row 2 - Employee Selection (Horizontal) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="size-5 text-primary" />
                <CardTitle>Chọn nhân viên thực hiện</CardTitle>
              </div>
              {selectedEmployees.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  <CheckCircle2Icon className="size-3.5 mr-1" />
                  {selectedEmployees.length} nhân viên
                </Badge>
              )}
            </div>
            <CardDescription>
              Chọn một hoặc nhiều nhân viên để phân công công việc này
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <div className="flex items-center justify-center text-center py-12 text-muted-foreground">
                <div>
                  <UserIcon className="size-12 mx-auto mb-3 opacity-50" />
                  <p>Không có nhân viên nào</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {employees.map((emp) => (
                  <label
                    key={emp.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedEmployees.includes(emp.id)
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'hover:bg-muted/50 border-border'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                      className="mt-1 size-4 rounded border-gray-300 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {emp.fullName || emp.email || 'Không rõ'}
                      </div>
                      {emp.email && emp.fullName && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {emp.email}
                        </div>
                      )}
                      {emp.role && (
                        <Badge variant="outline" className="mt-1.5 text-xs">
                          {emp.role}
                        </Badge>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !form.workTypeId || !form.planId || selectedEmployees.length === 0 || !form.startDate || !form.endDate}
            className="min-w-32"
          >
            {loading ? "Đang phân công..." : "Phân công"}
          </Button>
        </div>
      </form>
    </div>
  )
}
