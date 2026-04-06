"use client"

import { use, useState } from "react"
import Link from "next/link"
import { mockWorks, mockUsers } from "../../mock-data"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { IconArrowLeft, IconTrash, IconUserPlus } from "@tabler/icons-react"
import { toast } from "sonner"

const ROLES = ["Thực hiện", "Giám sát", "Hỗ trợ"]

export default function AssignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const work = mockWorks.find((w) => w.id === Number(id))

  const [assignments, setAssignments] = useState(work?.workUsers ?? [])
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedRole, setSelectedRole] = useState("")

  if (!work) return <div className="p-6">Không tìm thấy công việc.</div>

  const assignedUserIds = assignments.map((a) => a.userId)
  const availableUsers = mockUsers.filter((u) => !assignedUserIds.includes(u.id))

  function handleAssign() {
    if (!selectedUser || !selectedRole) {
      toast.error("Vui lòng chọn nhân viên và vai trò")
      return
    }
    const user = mockUsers.find((u) => u.id === selectedUser)!
    setAssignments((prev) => [
      ...prev,
      { id: Date.now(), userId: user.id, userName: user.name, role: selectedRole, status: "Active" },
    ])
    setSelectedUser("")
    setSelectedRole("")
    toast.success(`Đã phân công ${user.name}`)
  }

  function handleRemove(userId: string) {
    setAssignments((prev) => prev.filter((a) => a.userId !== userId))
    toast.success("Đã xóa phân công")
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/dashboard/works"><IconArrowLeft className="size-4" /></Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold md:text-2xl truncate">Phân công nhân viên</h1>
          <p className="text-sm text-muted-foreground truncate">{work.workTypeName} — {work.planName}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        {/* Form thêm */}
        <div className="rounded-lg border p-4 flex flex-col gap-4 h-fit">
          <h2 className="font-medium">Thêm nhân viên</h2>
          <div className="flex flex-col gap-3">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.length === 0
                  ? <SelectItem value="-" disabled>Không còn nhân viên</SelectItem>
                  : availableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button onClick={handleAssign} className="w-full">
              <IconUserPlus className="size-4" />
              Phân công
            </Button>
          </div>
        </div>

        {/* Danh sách đã phân công */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    Chưa có nhân viên nào được phân công
                  </TableCell>
                </TableRow>
              ) : assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.userName}</TableCell>
                  <TableCell><Badge variant="outline">{a.role}</Badge></TableCell>
                  <TableCell>
                    <span className="text-xs text-green-600 font-medium">{a.status}</span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => handleRemove(a.userId)}>
                      <IconTrash className="size-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
