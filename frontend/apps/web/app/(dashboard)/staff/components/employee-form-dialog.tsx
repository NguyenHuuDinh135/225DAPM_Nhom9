"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { apiClient } from "@/lib/api-client"
import { type EmployeeDto } from "../page"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: EmployeeDto
  onSuccess: () => void
}

const ROLES = ["Administrator", "Manager", "Employee"]

export function EmployeeFormDialog({ open, onOpenChange, employee, onSuccess }: Props) {
  const isEdit = !!employee
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState("Employee")
  const [status, setStatus] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setFullName(employee?.fullName ?? "")
      setEmail(employee?.email ?? "")
      setPassword("")
      setRole(employee?.role ?? "Employee")
      setStatus(employee?.status ?? 1)
      setError(null)
    }
  }, [open, employee])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isEdit) {
        await apiClient.put(`/api/employees/${employee!.id}`, { fullName, status })
      } else {
        await apiClient.post("/api/employees", { email, password, fullName, role })
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? "Có lỗi xảy ra.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Họ tên</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          {!isEdit && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="role">Vai trò</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </>
          )}
          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Trạng thái</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Không hoạt động</option>
              </select>
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
