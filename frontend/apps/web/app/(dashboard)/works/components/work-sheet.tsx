"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { 
  ClipboardList, Users, BarChart3, Clock, Calendar, 
  Trash2, ExternalLink, ChevronRight, Info, CheckCircle2
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@workspace/ui/components/sonner"
import type { WorkItem, WorkStatus } from "../page"

interface WorkSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  work?: WorkItem
  onSuccess: () => void
  canManage: boolean
}

const STATUS_VARIANTS: Record<WorkStatus, "default" | "secondary" | "destructive" | "outline"> = {
  New: "outline",
  InProgress: "secondary",
  WaitingForApproval: "outline",
  Completed: "default",
  Cancelled: "destructive",
}

export function WorkSheet({ open, onOpenChange, work, onSuccess, canManage }: WorkSheetProps) {
  const [loading, setLoading] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const handleDelete = () => {
    if (!work) return
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!work) return
    
    setLoading(true)
    try {
      await apiClient.delete(`/api/work-items/${work.id}`)
      toast.success("Đã xóa công tác thành công")
      setShowDeleteDialog(false)
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "Xóa thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] p-0 flex flex-col gap-0 border-l border-white/20 bg-background/80 backdrop-blur-xl">
        <SheetHeader className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">Chi tiết Công tác</SheetTitle>
              <SheetDescription>
                {work ? `ID: #${work.id} — ${work.workTypeName}` : "Thông tin chi tiết về nhiệm vụ chuyên môn"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1">
          {work && (
            <div className="p-6 space-y-8">
              {/* Trạng thái & Kế hoạch */}
              <section className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl border bg-card/50 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" /> Trạng thái
                  </span>
                  <Badge variant={STATUS_VARIANTS[work.status] ?? "outline"}>
                    {work.statusName}
                  </Badge>
                </div>
                <div className="p-3 rounded-xl border bg-card/50 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Info className="size-3" /> Loại công tác
                  </span>
                  <p className="text-sm font-semibold truncate">{work.workTypeName}</p>
                </div>
              </section>

              {/* Thông tin Kế hoạch */}
              <section className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thuộc kế hoạch</h4>
                <div className="p-4 rounded-xl border bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100">{work.planName}</p>
                    <p className="text-xs text-blue-700/70 dark:text-blue-400">Xem toàn bộ kế hoạch liên quan</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-blue-600" asChild>
                    <Link href={`/plans/${work.planId}`}><ExternalLink className="size-4" /></Link>
                  </Button>
                </div>
              </section>

              {/* Thời gian thực hiện */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calendar className="size-3" /> Lịch trình thực hiện
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Ngày bắt đầu</p>
                    <p className="text-sm font-medium">{work.startDate || "Chưa thiết lập"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Ngày kết thúc (Dự kiến)</p>
                    <p className="text-sm font-medium">{work.endDate || "Chưa thiết lập"}</p>
                  </div>
                </div>
              </section>

              {/* Tác vụ nhanh */}
              <section className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thực hiện tác vụ</h4>
                <div className="grid grid-cols-1 gap-2">
                  {canManage && (
                    <Button variant="outline" className="w-full justify-between h-12 group" asChild>
                      <Link href={`/works/${work.id}/assign`}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Users className="size-4" />
                          </div>
                          <span className="font-semibold text-sm">Phân công nhân sự</span>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full justify-between h-12 group" asChild>
                    <Link href={`/works/${work.id}/progress`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <BarChart3 className="size-4" />
                        </div>
                        <span className="font-semibold text-sm">Cập nhật tiến độ thực địa</span>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  </Button>
                </div>
              </section>
            </div>
          )}
        </ScrollArea>

        <Separator />

        <SheetFooter className="p-6 bg-muted/20">
          <div className="flex flex-col w-full gap-3">
            {canManage && work && (
              <Button 
                variant="ghost" 
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="mr-2 size-4" /> Xóa công tác này
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa công tác</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa công tác này không? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault()
              confirmDelete()
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  )
}
