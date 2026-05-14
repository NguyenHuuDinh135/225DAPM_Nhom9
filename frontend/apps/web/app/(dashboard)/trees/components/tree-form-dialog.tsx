"use client"

import { TreePineIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { LocationPicker } from "./location-picker"
import { type TreeRow } from "./columns"

export interface TreeFormData {
  name: string
  treeTypeId: number
  condition: string
  latitude: number
  longitude: number
}

interface TreeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingTree: TreeRow | null
  formData: TreeFormData
  onFormDataChange: (data: TreeFormData) => void
  onSubmit: () => void
}

export function TreeFormDialog({
  open,
  onOpenChange,
  editingTree,
  formData,
  onFormDataChange,
  onSubmit,
}: TreeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-green-600 p-8 text-white relative">
          <TreePineIcon className="absolute top-6 right-8 size-16 opacity-10 rotate-12" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
              {editingTree ? "Cập nhật thông tin" : "Thêm cây xanh mới"}
            </DialogTitle>
            <DialogDescription className="text-green-100 font-medium">
              Cung cấp dữ liệu chính xác để hệ thống quản lý và dự báo sinh trưởng tốt hơn.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-black uppercase text-slate-400 px-1">Tên cây (Tùy chọn)</Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Cây Sưa 01"
                  className="rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-green-500 h-12"
                  value={formData.name}
                  onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-black uppercase text-slate-400 px-1">Loại cây</Label>
                <Select
                  value={formData.treeTypeId.toString()}
                  onValueChange={(val) => onFormDataChange({ ...formData, treeTypeId: parseInt(val) })}
                >
                  <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12">
                    <SelectValue placeholder="Chọn loại cây" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <SelectItem value="1">Cây bóng mát</SelectItem>
                    <SelectItem value="2">Cây cảnh/Hoa</SelectItem>
                    <SelectItem value="3">Cây cổ thụ</SelectItem>
                    <SelectItem value="4">Cây ăn quả</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-black uppercase text-slate-400 px-1">Tình trạng</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(val) => onFormDataChange({ ...formData, condition: val })}
                >
                  <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-12">
                    <SelectValue placeholder="Tình trạng" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <SelectItem value="Tốt">Tốt</SelectItem>
                    <SelectItem value="Bình thường">Bình thường</SelectItem>
                    <SelectItem value="Sắp bệnh">Sắp bệnh</SelectItem>
                    <SelectItem value="Mới trồng">Mới trồng</SelectItem>
                    <SelectItem value="Cần cắt tỉa">Cần cắt tỉa</SelectItem>
                    <SelectItem value="Yếu">Yếu/Sâu bệnh</SelectItem>
                    <SelectItem value="Cần thay thế">Cần thay thế</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-black uppercase text-slate-400 px-1">Vĩ độ</Label>
                  <Input
                    type="number"
                    className="rounded-2xl border-slate-100 bg-slate-50 h-10 font-mono text-[11px]"
                    value={formData.latitude}
                    onChange={(e) => onFormDataChange({ ...formData, latitude: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-black uppercase text-slate-400 px-1">Kinh độ</Label>
                  <Input
                    type="number"
                    className="rounded-2xl border-slate-100 bg-slate-50 h-10 font-mono text-[11px]"
                    value={formData.longitude}
                    onChange={(e) => onFormDataChange({ ...formData, longitude: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase text-slate-400 px-1">Chọn vị trí trên bản đồ</Label>
              <LocationPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onChange={(lat, lng) => onFormDataChange({ ...formData, latitude: lat, longitude: lng })}
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:justify-between pt-4">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-2xl h-12 px-6 font-bold text-slate-400"
            >
              HỦY BỎ
            </Button>
            <Button
              onClick={onSubmit}
              className="rounded-2xl h-12 px-8 bg-green-600 hover:bg-green-700 font-bold shadow-lg shadow-green-600/30 min-w-[140px]"
            >
              {editingTree ? "CẬP NHẬT" : "LƯU DỮ LIỆU"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
