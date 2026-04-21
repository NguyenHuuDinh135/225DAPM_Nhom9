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
import { Label } from "@workspace/ui/components/label"
import { apiClient } from "@/lib/api-client"
import { type EmployeeDto } from "../page"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: EmployeeDto
  onSuccess: () => void
}

const ROLES = [
  { value: "Administrator", label: "Quản trị viên" },
  { value: "Manager", label: "Quản lý" },
  { value: "Employee", label: "Nhân viên" },
]

export function AssignRoleDialog({ open, onOpenChange, employee, onSuccess }: Props) {
  const [role, setRole] = React.useState(employee.role ?? "Employee")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setRole(employee.role ?? "Employee")
      setError(null)
    }
  }, [open, employee])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await apiClient.put(`/api/employees/${employee.id}/roles`, { userId: employee.id, role })
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
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Phân quyền — {employee.fullName ?? employee.email}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            {ROLES.map((r) => (
              <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={role === r.value}
                  onChange={() => setRole(r.value)}
                  className="accent-primary"
                />
                <Label className="cursor-pointer">{r.label}</Label>
              </label>
            ))}
          </div>
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
