"use client"

import { useRef, useState } from "react"
import { UploadIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@workspace/ui/components/dialog"
import { toast } from "@workspace/ui/components/sonner"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export function ImportTreesDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) { toast.error("Vui lòng chọn file Excel"); return }

    const fd = new FormData()
    fd.append("file", file)

    const token = localStorage.getItem("access_token")
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/trees/import`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Nhập dữ liệu thành công")
      setOpen(false)
      onSuccess()
    } catch (err) {
      toast.error((err as Error).message || "Nhập dữ liệu thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <UploadIcon className="mr-1 size-4" /> Nhập Excel
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Nhập dữ liệu cây xanh từ Excel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang nhập..." : "Nhập dữ liệu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
