"use client"

import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "@workspace/ui/components/sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Separator } from "@workspace/ui/components/separator"
import { Upload, User as UserIcon } from "lucide-react"
import { apiClient, getImageUrl } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"

interface Profile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  dateOfBirth: string | null
  role: string | null
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    apiClient.get<Profile>("/api/users/me").then((p) => {
      setProfile(p)
      setFullName(p.fullName ?? "")
      setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : "")
      if (p.avatarUrl) setPreview(getImageUrl(p.avatarUrl))
    }).catch(() => {})
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      if (fullName) fd.append("fullName", fullName)
      if (dateOfBirth) fd.append("dateOfBirth", dateOfBirth)
      if (avatar) fd.append("avatar", avatar)

      await apiClient.put("/api/users/me", fd)
      toast.success("Cập nhật hồ sơ thành công")
      
      // Refresh the page or update auth context if needed to show new avatar everywhere
      // Since it's a demo, we rely on the state and getImageUrl for now.
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thất bại")
    } finally {
      setLoading(false)
    }
  }

  if (!profile) return <div className="flex flex-1 items-center justify-center text-muted-foreground">Đang tải...</div>

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold">Cài đặt tài khoản</h1>
        <p className="text-sm text-muted-foreground">Xem và cập nhật thông tin cá nhân</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin hồ sơ</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative group">
                <Avatar className="size-24 border-2 border-muted shadow-sm hover:ring-4 hover:ring-green-500/20 transition-all">
                  {preview ? <AvatarImage src={preview} className="object-cover" /> : null}
                  <AvatarFallback className="bg-green-50 text-green-700">
                    <UserIcon className="size-10" />
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white"
                >
                  <Upload className="size-6" />
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Click vào ảnh để thay đổi</p>
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label>Email</Label>
                <Input value={profile.email} disabled className="bg-muted/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Vai trò</Label>
                <div><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{profile.role ?? "—"}</Badge></div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dob">Ngày sinh</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20">
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
