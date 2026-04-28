"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { ArrowLeftIcon, PlusIcon, UserIcon, Trash2Icon, SearchIcon, CalendarIcon, MapPinIcon } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"

interface WorkUser { userId: string; role: string | null; status: string | null }
interface WorkDetail { 
  id: number
  workTypeName: string | null
  planName: string | null
  startDate: string | null
  endDate: string | null
  locationName: string | null
  users: WorkUser[]
}
interface Employee { id: string; fullName: string | null; email: string | null }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export default function AssignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [work, setWork] = useState<WorkDetail | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [role, setRole] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  function loadWork() {
    const token = localStorage.getItem("access_token")
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    Promise.all([
      fetch(`${BASE_URL}/api/work-items/${id}`, { headers }).then((r) => r.ok ? r.json() : Promise.reject()),
      fetch(`${BASE_URL}/api/employees`, { headers }).then((r) => r.ok ? r.json() : { employees: [] }),
    ])
      .then(([workData, empData]: [WorkDetail, { employees: Employee[] }]) => {
        setWork(workData)
        setEmployees(empData.employees ?? [])
      })
      .catch(() => toast.error("Không thể tải dữ liệu"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadWork() }, [id])

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUserId) { toast.error("Vui lòng chọn nhân viên"); return }
    const token = localStorage.getItem("access_token")
    setSubmitting(true)
    try {
      const res = await fetch(`${BASE_URL}/api/work-items/${id}/assign-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ workId: Number(id), userId: selectedUserId, role: role.trim() || null }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Đã phân công nhân viên thành công")
      setDialogOpen(false)
      setSelectedUserId(""); setRole("")
      loadWork()
    } catch (err) {
      toast.error((err as Error).message || "Phân công thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemoveUser(userId: string) {
    if (!confirm("Xác nhận xóa nhân viên khỏi công việc này?")) return
    const token = localStorage.getItem("access_token")
    try {
      // TODO: Implement remove user API endpoint
      toast.info("Chức năng xóa nhân viên đang được phát triển")
      // const res = await fetch(`${BASE_URL}/api/work-items/${id}/remove-user`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      //   body: JSON.stringify({ userId }),
      // })
      // if (!res.ok) throw new Error(await res.text())
      // toast.success("Đã xóa nhân viên")
      // loadWork()
    } catch (err) {
      toast.error((err as Error).message || "Xóa thất bại")
    }
  }

  const filteredEmployees = employees.filter(e => 
    !searchQuery || 
    e.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const availableEmployees = filteredEmployees.filter(e => 
    !work?.users.some(u => u.userId === e.id)
  )

  if (loading) return <div className="p-6 text-muted-foreground">Đang tải...</div>
  if (!work) return <div className="p-6 text-muted-foreground">Không tìm thấy công tác.</div>

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/works"><ArrowLeftIcon className="size-4" /></Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Phân công nhân viên</h1>
          <p className="text-sm text-muted-foreground">Quản lý nhân viên thực hiện công việc</p>
        </div>
      </div>

      {/* Work Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{work.workTypeName}</CardTitle>
          <CardDescription>{work.planName}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {work.locationName && (
            <div className="flex items-center gap-2 text-sm">
              <MapPinIcon className="size-4 text-muted-foreground" />
              <span>{work.locationName}</span>
            </div>
          )}
          {work.startDate && work.endDate && (
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="size-4 text-muted-foreground" />
              <span>{new Date(work.startDate).toLocaleDateString('vi-VN')} - {new Date(work.endDate).toLocaleDateString('vi-VN')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg">Nhân viên được phân công</CardTitle>
            <CardDescription>
              {work.users.length === 0 ? "Chưa có nhân viên nào" : `${work.users.length} nhân viên`}
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <PlusIcon className="mr-1 size-4" /> Thêm nhân viên
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead className="hidden sm:table-cell">Trạng thái</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {work.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center gap-2">
                        <UserIcon className="size-12 text-muted-foreground/50" />
                        <p>Chưa có nhân viên nào được phân công</p>
                        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                          <PlusIcon className="mr-1 size-4" /> Thêm nhân viên đầu tiên
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : work.users.map((u) => {
                  const emp = employees.find((e) => e.id === u.userId)
                  return (
                    <TableRow key={u.userId}>
                      <TableCell>
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserIcon className="size-4" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{emp?.fullName ?? emp?.email ?? "Không rõ"}</span>
                          {emp?.email && emp?.fullName && (
                            <span className="text-xs text-muted-foreground">{emp.email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{u.role ?? "Nhân viên"}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {u.status ?? "Đã phân công"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveUser(u.userId)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Thêm nhân viên vào công việc</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssign} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Tìm kiếm nhân viên</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label>Chọn nhân viên *</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên..." />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {searchQuery ? "Không tìm thấy nhân viên" : "Tất cả nhân viên đã được phân công"}
                    </div>
                  ) : (
                    availableEmployees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        <div className="flex flex-col">
                          <span>{e.fullName ?? e.email ?? e.id}</span>
                          {e.email && e.fullName && (
                            <span className="text-xs text-muted-foreground">{e.email}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {availableEmployees.length} nhân viên khả dụng
              </p>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Vai trò trong công việc</Label>
              <Input 
                id="role" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                placeholder="VD: Kỹ thuật viên, Trưởng nhóm..."
              />
              <p className="text-xs text-muted-foreground">
                Để trống nếu không cần chỉ định vai trò cụ thể
              </p>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting || !selectedUserId}>
                {submitting ? "Đang phân công..." : "Phân công"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
