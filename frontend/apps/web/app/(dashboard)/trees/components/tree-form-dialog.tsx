"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { apiClient } from "@/lib/api-client"
import { type Tree, treeFormSchema, type TreeFormValues } from "../data/schema"

interface TreeType { id: number; name: string | null; group: string | null }

interface TreeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tree?: Tree
  onSuccess: () => void
}

const EMPTY: TreeFormValues = { name: "", treeTypeId: 0, condition: "" }

export function TreeFormDialog({ open, onOpenChange, tree, onSuccess }: TreeFormDialogProps) {
  const [values, setValues] = React.useState<TreeFormValues>(EMPTY)
  const [errors, setErrors] = React.useState<Partial<Record<keyof TreeFormValues, string>>>({})
  const [loading, setLoading] = React.useState(false)
  const [treeTypes, setTreeTypes] = React.useState<TreeType[]>([])

  React.useEffect(() => {
    apiClient.get<TreeType[]>("/api/lookups/tree-types").then(setTreeTypes).catch(() => {})
  }, [])

  React.useEffect(() => {
    if (open) {
      setValues(tree ? { name: tree.name ?? "", treeTypeId: tree.treeTypeId, condition: tree.condition ?? "" } : EMPTY)
      setErrors({})
    }
  }, [open, tree])

  function set(field: keyof TreeFormValues, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = treeFormSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof TreeFormValues, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof TreeFormValues
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setLoading(true)
    try {
      if (tree) {
        await apiClient.put(`/api/trees/${tree.id}`, parsed.data)
      } else {
        await apiClient.post("/api/trees", parsed.data)
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      alert(`Lỗi: ${error.message || 'Unknown error'}`)
      console.error('Submit error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{tree ? "Cập nhật cây xanh" : "Thêm cây xanh mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Tên cây</Label>
            <Input id="name" value={values.name} onChange={(e) => set("name", e.target.value)} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Loại cây</Label>
            <Select
              value={values.treeTypeId ? String(values.treeTypeId) : ""}
              onValueChange={(v) => set("treeTypeId", v)}
            >
              <SelectTrigger><SelectValue placeholder="Chọn loại cây..." /></SelectTrigger>
              <SelectContent>
                {treeTypes.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name ?? `#${t.id}`}{t.group ? ` (${t.group})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.treeTypeId && <p className="text-xs text-destructive">{errors.treeTypeId}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="condition">Tình trạng</Label>
            <Input id="condition" value={values.condition ?? ""} onChange={(e) => set("condition", e.target.value)} placeholder="Bình thường / Cần cắt tỉa / Sâu bệnh" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
