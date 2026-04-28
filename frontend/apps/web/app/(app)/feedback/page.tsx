"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Send, MessageSquare, User, Mail, Phone, Info } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function FeedbackPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "Administrator" || user?.role === "Manager"
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSuccess(true)
    toast.success("Cảm ơn ý kiến đóng góp của bạn!")
  }

  if (success) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <Send className="size-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Gửi phản hồi thành công!</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Chúng tôi đã ghi nhận ý kiến của bạn và sẽ phản hồi sớm nhất có thể qua email hoặc số điện thoại bạn đã cung cấp.
        </p>
        <Button onClick={() => window.location.href = "/"}>Quay lại Trang chủ</Button>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-muted/30">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {isAdmin && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Info className="size-4" />
              </div>
              <p className="text-sm font-medium">Bạn đang đăng nhập với quyền Quản trị. Xem các phản hồi từ người dân?</p>
            </div>
            <Button asChild variant="outline" size="sm" className="bg-white border-blue-200 hover:bg-blue-100 text-blue-800">
              <Link href="/feedback-inbox">Đến Hòm thư</Link>
            </Button>
          </div>
        )}
        <div className="bg-background rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-green-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <MessageSquare className="size-8" />
              Ý kiến phản ánh
            </h1>
            <p className="opacity-90">
              Hãy chia sẻ những góp ý hoặc vấn đề bạn gặp phải để chúng tôi phục vụ tốt hơn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" /> Họ và tên
                </Label>
                <Input id="name" placeholder="Nguyễn Văn A" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" /> Email
                </Label>
                <Input id="email" type="email" placeholder="email@example.com" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" /> Số điện thoại
                </Label>
                <Input id="phone" type="tel" placeholder="09xx xxx xxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-2">
                  <Info className="size-4 text-muted-foreground" /> Loại phản ánh
                </Label>
                <Select defaultValue="general">
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Chọn loại phản ánh" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Góp ý chung</SelectItem>
                    <SelectItem value="incident">Báo cáo sự cố</SelectItem>
                    <SelectItem value="request">Yêu cầu bảo trì</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội dung phản ánh</Label>
              <Textarea 
                id="content" 
                placeholder="Vui lòng mô tả chi tiết ý kiến của bạn..." 
                className="min-h-[150px] resize-none"
                required 
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full h-12 text-lg bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi ý kiến phản ánh"}
              </Button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground">
              Thông tin của bạn sẽ được bảo mật theo chính sách quyền riêng tư của hệ thống.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
