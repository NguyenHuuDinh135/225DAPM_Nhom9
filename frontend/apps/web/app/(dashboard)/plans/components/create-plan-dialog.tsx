"use client"

import * as React from "react"
import {
  ClipboardList, Plus, Calendar, ShieldCheck, Trash2
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from "@workspace/ui/components/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@workspace/ui/components/select"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@workspace/ui/components/sonner"

interface CreatePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreatePlanDialog({ open, onOpenChange, onSuccess }: CreatePlanDialogProps) {
  const { user } = useAuth()
  const [newPlanName, setNewPlanName] = React.useState("")
  const [newPlanDates, setNewPlanDates] = React.useState({ start: "", end: "" })
  const [initialWorkItems, setInitialWorkItems] = React.useState<{ workTypeId: number; treeIds: number[]; userIds: string[]; content: string }[]>([])
  const [workTypes, setWorkTypes] = React.useState<{ id: number; name: string }[]>([])

  React.useEffect(() => {
    if (open) {
      apiClient.get<{ id: number; name: string }[]>("/api/Lookups/work-types")
        .then(setWorkTypes)
        .catch(() => {})
    }
  }, [open])

  const handleAddInitialWork = () => {
    setInitialWorkItems([...initialWorkItems, { workTypeId: 1, treeIds: [], userIds: [], content: "" }])
  }

  const handleCreatePlan = async () => {
    if (!newPlanName) {
      toast.error("Vui lòng nhập tên kế hoạch")
      return
    }
    try {
      await apiClient.post("/api/Planning", {
        name: newPlanName,
        creatorId: user?.id || localStorage.getItem("user_id") || "",
        startDate: newPlanDates.start ? new Date(newPlanDates.start).toISOString() : new Date().toISOString(),
        endDate: newPlanDates.end ? new Date(newPlanDates.end).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        workItems: initialWorkItems.length > 0 ? initialWorkItems : null
      })
      toast.success("Thành công", { description: "Đã tạo kế hoạch mới." })
      onOpenChange(false)
      resetForm()
      onSuccess()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Vui lòng kiểm tra lại thông tin."
      toast.error("Lỗi tạo kế hoạch", { description: message })
    }
  }

  const resetForm = () => {
    setNewPlanName("")
    setNewPlanDates({ start: "", end: "" })
    setInitialWorkItems([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary p-8 text-white relative">
          <ClipboardList className="absolute top-6 right-6 size-16 opacity-10 rotate-12" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Lập Kế hoạch Chiến lược</DialogTitle>
            <DialogDescription className="text-blue-100 font-medium italic">Thiết lập lộ trình bảo trì và chăm sóc cây xanh toàn diện.</DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-8 space-y-6 bg-slate-50/50 backdrop-blur-xl">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tiêu đề kế hoạch</Label>
            <Input
              placeholder="VD: Bảo trì công viên 29/3 - Giai đoạn 1"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              className="h-14 rounded-2xl border-slate-200 bg-white focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold px-5 text-slate-700 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Ngày bắt đầu</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-4 size-4 text-slate-300 pointer-events-none" />
                <Input
                  type="date"
                  value={newPlanDates.start}
                  onChange={(e) => setNewPlanDates({...newPlanDates, start: e.target.value})}
                  className="h-12 rounded-xl border-slate-100 bg-white pl-11 font-bold text-slate-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Ngày kết thúc</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-4 size-4 text-slate-300 pointer-events-none" />
                <Input
                  type="date"
                  value={newPlanDates.end}
                  onChange={(e) => setNewPlanDates({...newPlanDates, end: e.target.value})}
                  className="h-12 rounded-xl border-slate-100 bg-white pl-11 font-bold text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Work items section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danh sách hạng mục ({initialWorkItems.length})</h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-lg text-primary font-black text-[9px] hover:bg-blue-50"
                onClick={handleAddInitialWork}
              >
                <Plus className="size-3 mr-1" /> THÊM HẠNG MỤC
              </Button>
            </div>

            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {initialWorkItems.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 size-6 rounded-full opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
                    onClick={() => setInitialWorkItems(initialWorkItems.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="size-3" />
                  </Button>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-300">Loại công việc</Label>
                    <Select
                      value={item.workTypeId.toString()}
                      onValueChange={(val) => {
                        const newItems = [...initialWorkItems];
                        const current = newItems[idx];
                        if (current) {
                          newItems[idx] = { ...current, workTypeId: parseInt(val) };
                        }
                        setInitialWorkItems(newItems);
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-slate-100 bg-slate-50 text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {workTypes.map((t) => (
                          <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              {initialWorkItems.length === 0 && (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-300 uppercase italic">Chưa có hạng mục đi kèm</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="p-8 pt-0 bg-slate-50/50">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-14 rounded-2xl font-bold text-slate-400 flex-1 hover:bg-slate-100">Hủy</Button>
          <Button
            onClick={handleCreatePlan}
            className="h-14 px-8 rounded-2xl bg-primary hover:bg-blue-700 font-black shadow-xl shadow-primary/30 flex-1 gap-2"
          >
            <ShieldCheck className="size-5" /> KÍCH HOẠT CHIẾN LƯỢC
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
