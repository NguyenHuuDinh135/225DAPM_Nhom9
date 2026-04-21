"use client"

import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "@workspace/ui/components/sonner"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"

interface Profile {
  id: string
  email: string
  fullName: string | null
  dateOfBirth: string | null
  role: string | null
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    apiClient.get<Profile>("/api/users/me").then((p) => {
      setProfile(p)
      setFullName(p.fullName ?? "")
      setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : "")
    }).catch(() => {})
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.put("/api/users/me", {
        fullName: fullName || null,
        dateOfBirth: dateOfBirth || null,
      })
      toast.success("Cập nhật hồ sơ thành công")
    } catch {
      toast.error("Cập nhật thất bại")
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
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input value={profile.email} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Vai trò</Label>
              <div><Badge variant="outline">{profile.role ?? "—"}</Badge></div>
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
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
