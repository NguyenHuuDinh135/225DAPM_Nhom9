"use client"

import { use, useState } from "react"
import Link from "next/link"
import { mockWorks, mockUsers } from "../../mock-data"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { ArrowLeftIcon, TrashIcon, UserPlusIcon } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"

const ROLES = ["Thực hiện", "Giám sát", "Hỗ trợ"]

export default function AssignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const work = mockWorks.find((w) => w.id === Number(id))

  const [assignments, setAssignments] = useState(work?.workUsers ?? [])
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedRole, setSelectedRole] = useState("")

  if (!work) return <div className="p-6 text-muted-foreground">Không tìm thấy công việc.</div>

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
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 min-w-0">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/works"><ArrowLeftIcon className="size-4" /></Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold md:text-2xl truncate">Phân công nhân viên</h1>
          <p className="text-sm text-muted-foreground truncate">{work.workTypeName} — {work.planName}</p>
        </div>
      </div>

      {/* Layout: stack trên mobile, 2 cột trên lg */}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Form thêm */}
        <div className="rounded-lg border p-4 flex flex-col gap-3 h-fit">
          <h2 className="font-medium">Thêm nhân viên</h2>
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
          <Button onClick={handleAssign} className="w-full bg-[#007B22] hover:bg-[#006400] text-white">
            <UserPlusIcon className="size-4" />
            Phân công
          </Button>
        </div>

        {/* Danh sách */}
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead className="hidden sm:table-cell">Trạng thái</TableHead>
                <TableHead className="w-10" />
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
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs text-green-600 font-medium">{a.status}</span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => handleRemove(a.userId)}>
                      <TrashIcon className="size-3.5 text-destructive" />
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
