"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@workspace/ui/components/sonner"
import { useAuth } from "@/hooks/use-auth"

interface AutoPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AutoPlanDialog({ open, onOpenChange, onSuccess }: AutoPlanDialogProps) {
  const { user } = useAuth()
  const [name, setName] = useState(`Kế hoạch bảo trì tự động - ${new Date().toLocaleDateString("vi-VN")}`)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<{ message: string, suggestedTreeIds: number[] } | null>(null)

  useEffect(() => {
    if (open) {
      fetchSuggestions()
    }
  }, [open])

  async function fetchSuggestions() {
    setAnalyzing(true)
    try {
      const data = await apiClient.get<any>("/api/Planning/ai-suggestions")
      setSuggestions(data)
    } catch (err) {
      toast.error("Lỗi AI", { description: "Không thể phân tích dữ liệu cây xanh lúc này." })
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleAutoCreate() {
    if (!suggestions || suggestions.suggestedTreeIds.length === 0) return

    setLoading(true)
    try {
      await apiClient.post("/api/Planning", {
        name,
        creatorId: user?.id || "",
        autoAssignTreeIds: suggestions.suggestedTreeIds,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      toast.success("Thành công", {
        description: `Đã tạo kế hoạch và tự động phân công cho ${suggestions.suggestedTreeIds.length} cây.`
      })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast.error("Lỗi", { description: "Không thể tạo kế hoạch tự động lúc này." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-blue-600 p-6 text-white relative">
            <Sparkles className="absolute top-4 right-4 size-12 opacity-20 rotate-12" />
            <DialogHeader>
                <DialogTitle className="text-2xl font-black">Thông minh hóa Vận hành</DialogTitle>
                <DialogDescription className="text-blue-100 font-medium">
                    Hệ thống sẽ tự động tạo công việc và phân bổ cho nhân sự phù hợp nhất.
                </DialogDescription>
            </DialogHeader>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
            {analyzing ? (
              <div className="py-10 text-center space-y-4">
                 <Loader2 className="size-10 animate-spin mx-auto text-blue-600" />
                 <p className="text-sm font-bold text-slate-500 animate-pulse">AI Đang phân tích sức khỏe cây xanh...</p>
              </div>
            ) : suggestions ? (
              <>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <div className="p-2 bg-blue-600 rounded-xl text-white">
                        {suggestions.suggestedTreeIds.length > 0 ? <CheckCircle2 className="size-5" /> : <AlertCircle className="size-5" />}
                    </div>
                    <div>
                        <p className="text-sm font-black text-blue-900">Phân tích hoàn tất</p>
                        <p className="text-xs text-blue-700 font-medium mt-0.5">
                            {suggestions.suggestedTreeIds.length > 0 
                              ? `Phát hiện ${suggestions.suggestedTreeIds.length} cây quá hạn bảo trì cần được xử lý ngay.`
                              : "Tất cả cây xanh đều đang ở trạng thái tốt. Không cần bảo trì khẩn cấp."}
                        </p>
                    </div>
                </div>

                {suggestions.suggestedTreeIds.length > 0 && (
                  <div className="space-y-2">
                      <Label htmlFor="planName" className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Tên kế hoạch</Label>
                      <Input 
                          id="planName" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="h-12 rounded-xl border-border/40 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                      />
                  </div>
                )}
              </>
            ) : null}
        </div>

        <DialogFooter className="p-6 pt-0 bg-muted/20">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">Hủy</Button>
            <Button 
                onClick={handleAutoCreate} 
                disabled={loading || analyzing || !suggestions || suggestions.suggestedTreeIds.length === 0}
                className="rounded-xl font-black bg-blue-600 hover:bg-blue-700 px-8 h-12 shadow-lg shadow-blue-600/20"
            >
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                Xác nhận & Chạy ngay
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
