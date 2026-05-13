"use client"

import * as React from "react"
import {
  UsersIcon, SearchIcon, ChevronRightIcon, Loader2, Mail,
  Edit2, Trash2, ChevronLeft, ChevronRight
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import { getRoleLabel } from "@/lib/roles"

interface EmployeeDto {
  id: string;
  userName: string;
  email: string;
  fullName: string | null;
  status: number;
  role: string | null;
  phoneNumber?: string;
}

interface StaffDataTableProps {
  employees: EmployeeDto[]
  loading: boolean
  search: string
  onSearchChange: (value: string) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onRowClick: (emp: EmployeeDto) => void
  onEdit: (emp: EmployeeDto, e: React.MouseEvent) => void
  onDelete: (id: string, e: React.MouseEvent) => void
  isAdmin: boolean
  currentUserEmail?: string
}

export function StaffDataTable({
  employees, loading, search, onSearchChange,
  page, pageSize, onPageChange,
  onRowClick, onEdit, onDelete,
  isAdmin, currentUserEmail
}: StaffDataTableProps) {
  const filteredEmployees = employees.filter(e =>
    !search ||
    e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filteredEmployees.length / pageSize)

  return (
    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Danh sách nhân sự ({filteredEmployees.length})</h3>
        <div className="relative w-full md:w-96 group">
          <SearchIcon className="absolute left-3.5 top-3 size-4 text-slate-400" />
          <Input
            className="pl-11 h-11 text-xs rounded-xl border-none bg-slate-100/50 focus-visible:ring-blue-500"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="text-[10px] font-black uppercase text-slate-400 px-6">Họ tên & Tài khoản</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-slate-400">Vai trò</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-slate-400">Trạng thái</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase text-slate-400 px-6">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-64 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-10 animate-spin text-blue-600" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải đội ngũ...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedEmployees.length > 0 ? (
            paginatedEmployees.map(emp => (
              <TableRow
                key={emp.id}
                className="group hover:bg-blue-50/30 transition-colors border-slate-50 cursor-pointer"
                onClick={() => onRowClick(emp)}
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <UsersIcon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{emp.fullName || "Chưa cập nhật tên"}</p>
                      <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                        <Mail className="size-3" />
                        <span className="text-[11px] font-medium">{emp.email}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white border-slate-200 text-slate-600 shadow-sm">
                    {getRoleLabel(emp.role ?? "NhanVien")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full", emp.status === 1 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-slate-300")} />
                    <span className="text-[11px] font-bold text-slate-600">{emp.status === 1 ? "ĐANG HOẠT ĐỘNG" : "BỊ KHÓA"}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAdmin && emp.email !== currentUserEmail && (
                      <>
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl text-blue-600 hover:bg-blue-50" onClick={(e) => onEdit(emp, e)}>
                          <Edit2 className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl text-red-600 hover:bg-red-50" onClick={(e) => onDelete(emp.id, e)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-400">
                      <ChevronRightIcon className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-64 text-center text-slate-400 italic font-medium">
                Không tìm thấy nhân viên nào phù hợp.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Hiển thị {paginatedEmployees.length} / {filteredEmployees.length} nhân sự
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "ghost"}
                  className={cn("h-9 w-9 rounded-xl text-xs font-bold", page === i + 1 ? "bg-blue-600 shadow-lg shadow-blue-600/20" : "")}
                  onClick={() => onPageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
