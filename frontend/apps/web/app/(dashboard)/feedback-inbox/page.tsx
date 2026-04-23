"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Eye, Mail, MessageSquare, Search } from "lucide-react"

const mockFeedbacks = [
  { id: 1, name: "Nguyễn Văn A", email: "vana@gmail.com", type: "Góp ý", content: "Hệ thống bản đồ rất tốt, nhưng cần thêm thông tin về tuổi thọ cây.", status: "Mới", date: "2024-04-20" },
  { id: 2, name: "Trần Thị B", email: "thib@yahoo.com", type: "Sự cố", content: "Có một cây đổ tại đường Bạch Đằng, gần cầu Rồng.", status: "Đang xử lý", date: "2024-04-19" },
  { id: 3, name: "Lê Văn C", email: "vanc@outlook.com", type: "Yêu cầu", content: "Đề nghị cắt tỉa cành cây che khuất biển báo giao thông tại ngã tư.", status: "Đã xong", date: "2024-04-18" },
  { id: 4, name: "Phạm Minh D", email: "minhd@gmail.com", type: "Góp ý", content: "Nên có thêm chức năng xem lịch sử bảo trì cây xanh.", status: "Mới", date: "2024-04-17" },
]

export default function FeedbackInboxPage() {
  const [filter, setFilter] = React.useState("")

  return (
    <div className="flex h-full flex-1 flex-col gap-8 p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Hòm thư góp ý</h2>
        <p className="text-muted-foreground">Quản lý các ý kiến phản ánh và đóng góp từ người dân.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm phản hồi..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Người gửi</TableHead>
              <TableHead className="w-[200px]">Liên hệ</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="max-w-[300px]">Nội dung</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFeedbacks.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="size-3" /> {f.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{f.type}</Badge>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {f.content}
                </TableCell>
                <TableCell>
                  <Badge variant={f.status === "Mới" ? "default" : f.status === "Đang xử lý" ? "secondary" : "outline"}>
                    {f.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(f.date).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MessageSquare className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
