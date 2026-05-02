"use client"

import * as React from "react"
import { ActivityIcon, UsersIcon, CheckCircleIcon } from "lucide-react"
import { Card } from "@workspace/ui/components/card"

export default function AnalyticsPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Phân tích hệ thống</h1>
          <p className="text-sm text-slate-500 font-medium">Theo dõi hiệu năng và tình trạng hoạt động thực tế.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard title="Tỷ lệ hoàn thành công việc" value="94.2%" icon={CheckCircleIcon} color="green" />
        <AnalyticsCard title="Năng suất nhân viên trung bình" value="4.5 tasks/ngày" icon={UsersIcon} color="blue" />
        <AnalyticsCard title="Tốc độ phản hồi sự cố" value="1.2 giờ" icon={ActivityIcon} color="orange" />
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white p-12 flex flex-col items-center justify-center text-center h-[400px]">
        <ActivityIcon className="size-16 text-slate-200 mb-4" />
        <h3 className="text-lg font-black text-slate-800">Bảng điều khiển hiệu suất</h3>
        <p className="text-sm text-slate-500 max-w-md mt-2">Dữ liệu phân tích đang được tổng hợp. Hệ thống sẽ sớm cung cấp báo cáo chi tiết về năng suất của từng tổ đội.</p>
      </Card>
    </div>
  )
}

function AnalyticsCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  const colors: any = {
    green: "text-green-600 bg-green-50",
    blue: "text-blue-600 bg-blue-50",
    orange: "text-orange-600 bg-orange-50"
  }
  return (
    <Card className="p-6 border-none shadow-sm rounded-3xl bg-white flex items-center gap-4">
      <div className={cn("size-12 rounded-2xl flex items-center justify-center", colors[color])}>
        <Icon className="size-6" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
        <p className="text-xl font-black text-slate-800">{value}</p>
      </div>
    </Card>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
