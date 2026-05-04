"use client"

import { use, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { 
  ArrowLeft, Send, CheckCircle2, Clock, Camera, 
  History, Sparkles, User, Percent, ClipboardList,
  ChevronLeft, Loader2, Image as ImageIcon, X
} from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { Skeleton } from "@workspace/ui/components/skeleton"

interface ProgressEntry { 
  id: number; 
  updaterId: string; 
  percentage: number | null; 
  note: string | null; 
  updatedDate: string | null; 
  images: string[] 
}

interface WorkDetail { 
  id: number; 
  workTypeName: string | null; 
  planName: string | null; 
  statusName: string;
  progresses: ProgressEntry[] 
}

export default function ProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [work, setWork] = useState<WorkDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [note, setNote] = useState("")
  const [percentage, setPercentage] = useState("100")
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  function loadWork() {
    setLoading(true)
    apiClient.get<WorkDetail>(`/api/work-items/${id}`)
      .then((data) => setWork(data))
      .catch((err) => {
        console.error("LoadWork Error:", err);
        toast.error("Không thể tải thông tin công tác");
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadWork() }, [id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // Cleanup các object URL cũ để tránh memory leak
      previewImages.forEach(url => URL.revokeObjectURL(url))
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file))
      setPreviewImages(newPreviews)
    }
  }

  // Cleanup object URLs khi component unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url))
    }
  }, [previewImages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const pct = Number(percentage)

    // Validate percentage hợp lệ (0-100)
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Tiến độ phải là số từ 0 đến 100")
      return
    }

    // Bắt buộc nhập ghi chú trong mọi trường hợp để có bằng chứng công việc
    if (!note.trim()) {
      toast.error("Vui lòng nhập mô tả công việc đã thực hiện")
      return
    }

    const fd = new FormData()
    fd.append("note", note)
    if (percentage) fd.append("percentage", percentage)
    
    const files = fileRef.current?.files
    if (files) for (const f of Array.from(files)) fd.append("images", f)
    
    setSubmitting(true)
    try {
      await apiClient.post(`/api/work-items/${id}/report-progress`, fd)
      
      toast.success(percentage === "100" ? "Đã gửi báo cáo hoàn thành!" : "Đã cập nhật tiến độ")
      setNote("")
      previewImages.forEach(url => URL.revokeObjectURL(url))
      setPreviewImages([])
      if (fileRef.current) fileRef.current.value = ""
      loadWork()
    } catch (err: any) {
      console.error("Submit Error:", err);
      toast.error(err.message || "Cập nhật thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-5xl mx-auto w-full">
        <Skeleton className="h-12 w-48 rounded-2xl" />
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <Skeleton className="h-[500px] rounded-[3rem]" />
            <Skeleton className="h-[500px] rounded-[3rem]" />
        </div>
    </div>
  )

  if (!work) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="size-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <X className="size-10 text-red-500" />
        </div>
        <h3 className="text-xl font-black text-foreground">Không tìm thấy công tác</h3>
        <Button variant="link" asChild className="mt-2 text-primary">
            <Link href="/worker">Quay lại Dashboard</Link>
        </Button>
    </div>
  )

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-5xl mx-auto w-full min-h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="size-12 rounded-2xl border-none bg-muted/50 hover:bg-muted shrink-0 transition-all" asChild>
                <Link href="/worker">
                    <ChevronLeft className="size-6 text-foreground" />
                </Link>
            </Button>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3">
                        {work.workTypeName}
                    </Badge>
                    <Badge variant="outline" className="border-muted-foreground/20 text-muted-foreground font-bold text-[10px] uppercase tracking-widest px-3">
                        ID: #{work.id}
                    </Badge>
                </div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">{work.planName || "Kế hoạch bảo trì"}</h1>
            </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="size-3 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-black text-primary uppercase tracking-tighter">Trạng thái: {work.statusName}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left: Reporting Form */}
        <div className="space-y-6">
            <Card className="rounded-[3rem] border-none shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                            <ClipboardList className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-foreground">Báo cáo tiến độ</h2>
                            <p className="text-sm font-medium text-muted-foreground">Cập nhật kết quả xử lý tại hiện trường</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <Label htmlFor="note" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Mô tả công việc</Label>
                            <Textarea 
                                id="note" 
                                placeholder="VD: Đã cắt tỉa cành khô, kiểm tra gốc cây và bón phân..." 
                                value={note} 
                                onChange={(e) => setNote(e.target.value)} 
                                rows={4}
                                className="rounded-[1.5rem] border-muted-foreground/10 bg-muted/30 focus:bg-background focus:ring-primary transition-all p-5 text-base font-medium"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="pct" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tiến độ (%)</Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform">
                                        <Percent className="size-5" />
                                    </div>
                                    <input 
                                        id="pct" 
                                        type="number" 
                                        min={0} 
                                        max={100} 
                                        value={percentage}
                                        onChange={(e) => setPercentage(e.target.value)} 
                                        placeholder="100"
                                        className="h-14 w-full rounded-2xl border border-muted-foreground/10 bg-muted/30 pl-12 pr-4 text-lg font-black focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Minh chứng hình ảnh</Label>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => fileRef.current?.click()}
                                    className="h-14 w-full rounded-2xl border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary text-primary font-black transition-all"
                                >
                                    <Camera className="mr-2 size-5" /> Chụp/Tải ảnh
                                </Button>
                                <input id="images" ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                            </div>
                        </div>

                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-4 gap-3 p-4 rounded-2xl bg-muted/20">
                                {previewImages.map((src, i) => (
                                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                                        <img src={src} alt="preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <ImageIcon className="size-5 text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                            <div className="size-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                                <Sparkles className="size-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-amber-900">Xác thực bởi AI</p>
                                <p className="text-xs font-medium text-amber-800/60 leading-relaxed">
                                    Ảnh của bạn sẽ được AI phân tích để tự động nghiệm thu. Hãy đảm bảo ảnh rõ nét và chụp đúng đối tượng.
                                </p>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={submitting} 
                            className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-2xl shadow-primary/20 transition-all active:scale-95"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-3 size-6 animate-spin" />
                                    Đang xử lý dữ liệu...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-3 size-6" />
                                    Gửi báo cáo công tác
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>

        {/* Right: History Timeline */}
        <div className="space-y-6">
            <div className="flex items-center justify-between ml-2">
                <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">Lịch sử cập nhật</h2>
                <History className="size-4 text-muted-foreground" />
            </div>

            <div className="space-y-4">
                {work.progresses.length === 0 ? (
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-card/50 backdrop-blur-xl p-10 flex flex-col items-center justify-center text-center">
                        <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <Clock className="size-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground">Chưa có cập nhật nào.<br/>Hãy bắt đầu báo cáo công tác.</p>
                    </Card>
                ) : (
                    <div className="space-y-4 relative before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-1 before:bg-gradient-to-b before:from-primary/20 before:to-transparent">
                        {[...work.progresses].reverse().map((p) => (
                            <div key={p.id} className="relative pl-14 group">
                                <div className="absolute left-0 top-1 size-14 rounded-2xl bg-background border-4 border-muted/20 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 z-10">
                                    <div className="size-4 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                </div>
                                <Card className="rounded-[2rem] border-none shadow-xl bg-card/50 backdrop-blur-xl hover:bg-card transition-colors">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <User className="size-3 text-primary" />
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{p.updaterId.substring(0, 8)}...</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-green-500/10 text-green-600 border-none font-black text-[10px] px-2">
                                                    {p.percentage}%
                                                </Badge>
                                                <span className="text-[10px] font-bold text-muted-foreground">
                                                    {p.updatedDate && new Date(p.updatedDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        {p.note && <p className="text-sm font-medium text-foreground leading-relaxed line-clamp-3">{p.note}</p>}
                                        
                                        {p.images.length > 0 && (
                                            <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                                                {p.images.map((src, idx) => (
                                                    <a 
                                                        key={idx} 
                                                        href={src} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="size-12 rounded-lg overflow-hidden shrink-0 border border-muted-foreground/10 hover:border-primary transition-colors"
                                                    >
                                                        <img src={src} alt="work" className="w-full h-full object-cover" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}
