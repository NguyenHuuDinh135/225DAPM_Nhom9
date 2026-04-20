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
import { planFormSchema, type PlanFormValues } from "../data/schema"

interface PlanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const EMPTY: PlanFormValues = { name: "", startDate: "", endDate: "" }

export function PlanFormDialog({ open, onOpenChange, onSuccess }: PlanFormDialogProps) {
  const [values, setValues] = React.useState<PlanFormValues>(EMPTY)
  const [errors, setErrors] = React.useState<Partial<Record<keyof PlanFormValues, string>>>({})
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setValues(EMPTY)
      setErrors({})
    }
  }, [open])

  function set(field: keyof PlanFormValues, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = planFormSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof PlanFormValues, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof PlanFormValues
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setLoading(true)
    try {
      const creatorId = typeof window !== "undefined" ? (localStorage.getItem("user_id") ?? "") : ""
      await apiClient.post("/api/planning", {
        name: parsed.data.name,
        creatorId,
        startDate: parsed.data.startDate || null,
        endDate: parsed.data.endDate || null,
      })
      onSuccess()
      onOpenChange(false)
    } catch {
      // errors handled by apiClient
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Tạo kế hoạch mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Tiêu đề</Label>
            <Input id="name" value={values.name} onChange={(e) => set("name", e.target.value)} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="startDate">Ngày bắt đầu</Label>
            <Input
              id="startDate"
              type="date"
              value={values.startDate ?? ""}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="endDate">Ngày kết thúc</Label>
            <Input
              id="endDate"
              type="date"
              value={values.endDate ?? ""}
              onChange={(e) => set("endDate", e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Tạo"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
