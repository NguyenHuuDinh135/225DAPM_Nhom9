"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeftIcon, 
  CameraIcon, 
  SendIcon, 
  CheckCircle2Icon, 
  AlertCircleIcon, 
  UserIcon, 
  PhoneIcon, 
  HashIcon,
  XIcon,
  Loader2Icon,
  ShieldAlertIcon
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { toast } from "@workspace/ui/components/sonner"
import { apiClient } from "@/lib/api-client"

import { Suspense } from "react"
// ... keep other imports ...

function ReportIncidentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const treeIdParam = searchParams.get("treeId") ?? ""

  const [treeId, setTreeId] = useState(treeIdParam)
  const [reporterName, setReporterName] = useState("")
  const [reporterPhone, setReporterPhone] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Cleanup previews on unmount
    return () => previews.forEach(p => URL.revokeObjectURL(p))
  }, [previews])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedImages(prev => [...prev, ...files])
      
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    const preview = previews[index];
    if (preview) URL.revokeObjectURL(preview);
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!treeId) {
      toast.error("Vui lòng nhập Mã cây")
      return
    }
    
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("treeId", treeId)
      if (reporterName) fd.append("reporterName", reporterName)
      if (reporterPhone) fd.append("reporterPhone", reporterPhone)
      if (content) fd.append("content", content)
      
      selectedImages.forEach(file => {
        fd.append("images", file)
      })

      await apiClient.post("/api/tree-incidents/report-incident", fd)
      setSuccess(true)
      toast.success("Báo cáo sự cố đã được gửi thành công")
    } catch (error) {
      toast.error("Gửi báo cáo thất bại, vui lòng thử lại.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (success) {
      timer = setTimeout(() => {
        router.push("/")
      }, 5000)
    }
    return () => clearTimeout(timer)
  }, [success, router])

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh] gap-6 p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="size-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-inner">
          <CheckCircle2Icon className="size-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-green-800 tracking-tight">Cảm ơn sự đóng góp của bạn!</h2>
          <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
            Báo cáo sự cố của bạn đã được tiếp nhận. Hệ thống sẽ tự động quay về trang chủ sau vài giây...
          </p>
        </div>
        <div className="flex flex-col w-full max-w-xs gap-3">
          <Button asChild className="bg-green-600 hover:bg-green-700 h-12 text-sm font-bold shadow-lg shadow-green-600/20">
            <Link href="/">Quay lại trang chủ ngay</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b px-4 py-4 flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeftIcon className="size-5" />
        </Link>
        <div>
          <h1 className="font-black text-slate-800 text-lg leading-none">Báo cáo sự cố</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Cây xanh Đà Nẵng</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Banner khẩn cấp */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex gap-3 items-start">
          <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
            <ShieldAlertIcon className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-orange-800">Thông tin khẩn cấp?</h4>
            <p className="text-xs text-orange-700/80 leading-relaxed mt-0.5">
              Nếu cây có nguy cơ đổ ngay lập tức, vui lòng gọi điện trực tiếp cho hotline: <span className="font-bold">1900 xxxx</span>.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Thông tin định danh */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <HashIcon className="size-3" /> Thông tin cây xanh
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="treeId" className="text-xs font-bold text-slate-700">Mã định danh cây <span className="text-red-500">*</span></Label>
              <div className="relative">
                <HashIcon className="absolute left-3 top-2.5 size-4 text-slate-400" />
                <Input 
                  id="treeId"
                  required 
                  type="number" 
                  min={1} 
                  value={treeId} 
                  onChange={(e) => setTreeId(e.target.value)}
                  className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-green-500" 
                  placeholder="Ví dụ: 1024" 
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic px-1">Mã cây được gắn trên biển hiệu của mỗi gốc cây.</p>
            </div>
          </div>

          {/* Section 2: Thông tin người báo */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <UserIcon className="size-3" /> Thông tin liên hệ
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-slate-700">Họ và tên</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 size-4 text-slate-400" />
                  <Input 
                    id="name"
                    value={reporterName} 
                    onChange={(e) => setReporterName(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 border-none" 
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Số điện thoại</Label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-2.5 size-4 text-slate-400" />
                  <Input 
                    id="phone"
                    type="tel" 
                    value={reporterPhone} 
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 border-none" 
                    placeholder="09xx xxx xxx"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Nội dung sự cố */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <AlertCircleIcon className="size-3" /> Chi tiết sự cố
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="content" className="text-xs font-bold text-slate-700">Mô tả tình trạng</Label>
              <Textarea 
                id="content"
                rows={4} 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                className="bg-slate-50 border-none resize-none focus-visible:ring-2 focus-visible:ring-green-500"
                placeholder="Ví dụ: Cây có dấu hiệu nghiêng sau bão, cành lớn bị gãy treo trên không..." 
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-bold text-slate-700">Hình ảnh hiện trường</Label>
              
              <div className="grid grid-cols-3 gap-3">
                {previews.map((src, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={src} className="h-full w-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))}
                
                {previews.length < 6 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-50 hover:border-green-300 hover:text-green-500 transition-all"
                  >
                    <CameraIcon className="size-6" />
                    <span className="text-[10px] font-bold uppercase">Thêm ảnh</span>
                  </button>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                ref={fileRef}
                onChange={handleFileChange}
                className="hidden" 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !treeId}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black text-base rounded-2xl shadow-xl shadow-green-600/20 gap-2 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : (
              <SendIcon className="size-5" />
            )}
            {loading ? "ĐANG GỬI BÁO CÁO..." : "GỬI BÁO CÁO NGAY"}
          </Button>
          
          <p className="text-center text-[10px] text-slate-400 px-4 italic">
            Thông tin của bạn sẽ được giữ bí mật và chỉ phục vụ mục đích xử lý sự cố công cộng.
          </p>
        </form>
      </div>
    </div>
  )
}

export default function ReportIncidentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2Icon className="size-8 animate-spin text-green-600" /></div>}>
      <ReportIncidentForm />
    </Suspense>
  )
}
