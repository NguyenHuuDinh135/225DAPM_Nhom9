"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Calendar, Plus, Loader2, ClipboardList } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { planFormSchema, type PlanFormValues } from "../data/schema"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@workspace/ui/components/sonner"

interface PlanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const EMPTY: PlanFormValues = { name: "", startDate: "", endDate: "" }

export function PlanFormDialog({ open, onOpenChange, onSuccess }: PlanFormDialogProps) {
  const { user } = useAuth()
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
      await apiClient.post("/api/planning", {
        name: parsed.data.name,
        creatorId: user?.id ?? "",
        startDate: parsed.data.startDate || null,
        endDate: parsed.data.endDate || null,
      })
      toast.success("Đã tạo kế hoạch mới")
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
      <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary p-8 text-primary-foreground relative">
            <ClipboardList className="absolute top-6 right-6 size-16 opacity-10 rotate-12" />
            <DialogHeader>
                <DialogTitle className="text-2xl font-black">Lập Kế Hoạch</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 font-medium">
                    Thiết lập mục tiêu và thời gian bảo trì định kỳ cho đội ngũ.
                </DialogDescription>
            </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 bg-card/50 backdrop-blur-xl">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Tiêu đề kế hoạch</Label>
            <div className="relative">
                <Input 
                    id="name" 
                    placeholder="VD: Kế hoạch bảo trì Quận 1 - Tháng 5"
                    className="h-12 rounded-2xl border-border/40 focus:ring-primary/20 focus:border-primary transition-all font-bold px-4"
                    value={values.name} 
                    onChange={(e) => set("name", e.target.value)} 
                />
            </div>
            {errors.name && <p className="text-[10px] font-bold text-destructive uppercase tracking-tight mt-1 ml-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Ngày bắt đầu</Label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="startDate"
                      type="date"
                      className="h-12 rounded-2xl border-border/40 focus:ring-primary/20 focus:border-primary transition-all font-bold pl-11"
                      value={values.startDate ?? ""}
                      onChange={(e) => set("startDate", e.target.value)}
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Ngày kết thúc</Label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="endDate"
                      type="date"
                      className="h-12 rounded-2xl border-border/40 focus:ring-primary/20 focus:border-primary transition-all font-bold pl-11"
                      value={values.endDate ?? ""}
                      onChange={(e) => set("endDate", e.target.value)}
                    />
                </div>
              </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl font-bold flex-1">
                Hủy
            </Button>
            <Button 
                type="submit" 
                disabled={loading}
                className="h-12 rounded-2xl font-black flex-1 shadow-lg shadow-primary/20"
            >
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
                Tạo kế hoạch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
