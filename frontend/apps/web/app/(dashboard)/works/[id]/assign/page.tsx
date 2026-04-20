"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"

interface WorkUser {
  userId: string
  role: string | null
  status: string | null
}

interface WorkDetail {
  id: number
  workTypeName: string | null
  planName: string | null
  users: WorkUser[]
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export default function AssignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [work, setWork] = useState<WorkDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    fetch(`${BASE_URL}/api/work-items/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: WorkDetail) => setWork(data))
      .catch(() => toast.error("Không thể tải thông tin công việc"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6 text-muted-foreground">Đang tải...</div>
  if (!work) return <div className="p-6 text-muted-foreground">Không tìm thấy công việc.</div>

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-w-0">
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/works"><ArrowLeftIcon className="size-4" /></Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold md:text-2xl truncate">Phân công nhân viên</h1>
          <p className="text-sm text-muted-foreground truncate">{work.workTypeName} — {work.planName}</p>
        </div>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Mã nhân viên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead className="hidden sm:table-cell">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {work.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                  Chưa có nhân viên nào được phân công
                </TableCell>
              </TableRow>
            ) : work.users.map((u) => (
              <TableRow key={u.userId}>
                <TableCell className="font-medium font-mono text-sm">{u.userId}</TableCell>
                <TableCell><Badge variant="outline">{u.role ?? "—"}</Badge></TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-xs text-green-600 font-medium">{u.status ?? "—"}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
