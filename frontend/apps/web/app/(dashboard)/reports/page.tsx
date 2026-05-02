"use client"

import * as React from "react"
import { BarChart3Icon, DownloadIcon, PieChartIcon, TrendingUpIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"

export default function ReportsPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Báo cáo chiến lược</h1>
          <p className="text-sm text-slate-500 font-medium">Tổng hợp số liệu, phân tích hiệu suất và định hướng quản lý.</p>
        </div>
        
        <Button className="bg-slate-800 hover:bg-slate-900 h-11 px-6 rounded-xl shadow-lg font-bold gap-2">
          <DownloadIcon className="size-5" /> XUẤT BÁO CÁO (PDF)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard title="Báo cáo Mật độ phủ xanh" icon={PieChartIcon} desc="Phân tích tỷ lệ cây xanh theo từng quận/huyện." color="green" />
        <ReportCard title="Hiệu suất xử lý sự cố" icon={BarChart3Icon} desc="Đánh giá thời gian phản hồi của đội ngũ thực địa." color="blue" />
        <ReportCard title="Dự báo chi phí bảo trì" icon={TrendingUpIcon} desc="Ước tính ngân sách cắt tỉa, chăm sóc quý tới." color="orange" />
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white p-12 flex flex-col items-center justify-center text-center h-[400px]">
        <BarChart3Icon className="size-16 text-slate-200 mb-4" />
        <h3 className="text-lg font-black text-slate-800">Khu vực phân tích Dữ liệu lớn</h3>
        <p className="text-sm text-slate-500 max-w-md mt-2">Tính năng phân tích nâng cao đang được xây dựng. Các biểu đồ chi tiết sẽ sớm được cập nhật tại đây.</p>
      </Card>
    </div>
  )
}

function ReportCard({ title, icon: Icon, desc, color }: { title: string, icon: any, desc: string, color: string }) {
  const colors: any = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600"
  }
  return (
    <Card className="p-6 border-none shadow-sm rounded-3xl bg-white hover:scale-[1.02] transition-transform cursor-pointer">
      <div className={cn("size-10 rounded-xl flex items-center justify-center mb-4", colors[color])}>
        <Icon className="size-5" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </Card>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
