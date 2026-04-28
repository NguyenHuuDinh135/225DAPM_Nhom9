"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { ArrowLeftIcon, PlusIcon } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"

interface WorkUser { userId: string; role: string | null; status: string | null }
interface WorkDetail { id: number; workTypeName: string | null; planName: string | null; users: WorkUser[] }
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
      toast.success("Đã phân công nhân viên")
      setDialogOpen(false)
      setSelectedUserId(""); setRole("")
      loadWork()
    } catch (err) {
      toast.error((err as Error).message || "Phân công thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Đang tải...</div>
  if (!work) return <div className="p-6 text-muted-foreground">Không tìm thấy công tác.</div>

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-w-0">
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/works"><ArrowLeftIcon className="size-4" /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold md:text-2xl truncate">Phân công nhân viên</h1>
            <p className="text-sm text-muted-foreground truncate">{work.workTypeName} — {work.planName}</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusIcon className="mr-1 size-4" /> Thêm nhân viên
        </Button>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead className="hidden sm:table-cell">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {work.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                  Chưa có nhân viên nào được phân công.
                </TableCell>
              </TableRow>
            ) : work.users.map((u) => {
              const emp = employees.find((e) => e.id === u.userId)
              return (
                <TableRow key={u.userId}>
                  <TableCell className="font-medium">
                    {emp?.fullName ?? emp?.email ?? <span className="font-mono text-xs text-muted-foreground">{u.userId}</span>}
                  </TableCell>
                  <TableCell><Badge variant="outline">{u.role ?? "—"}</Badge></TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs text-green-600 font-medium">{u.status ?? "—"}</span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader><DialogTitle>Thêm nhân viên</DialogTitle></DialogHeader>
          <form onSubmit={handleAssign} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Nhân viên</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger><SelectValue placeholder="Chọn nhân viên..." /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.fullName ?? e.email ?? e.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Vai trò (tuỳ chọn)</Label>
              <input id="role" value={role} onChange={(e) => setRole(e.target.value)}
                placeholder="Kỹ thuật viên..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Đang phân công..." : "Phân công"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
