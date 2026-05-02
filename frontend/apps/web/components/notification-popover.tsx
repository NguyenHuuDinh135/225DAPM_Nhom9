"use client"

import * as React from "react"
import { BellIcon, CheckIcon, InfoIcon, AlertTriangleIcon, XIcon, ClockIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  type: "info" | "warning" | "success" | "error"
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Sự cố mới",
    description: "Có một cây đổ tại đường Lê Duẩn cần xử lý gấp.",
    time: "2 phút trước",
    type: "warning",
    read: false,
  },
  {
    id: "2",
    title: "Kế hoạch đã duyệt",
    description: "Giám đốc đã phê duyệt kế hoạch bảo trì tháng 4.",
    time: "1 giờ trước",
    type: "success",
    read: false,
  },
  {
    id: "3",
    title: "Hệ thống bảo trì",
    description: "Hệ thống sẽ bảo trì vào lúc 23:00 đêm nay.",
    time: "3 giờ trước",
    type: "info",
    read: true,
  },
]

export function NotificationPopover() {
  const [notifications, setNotifications] = React.useState<Notification[]>(MOCK_NOTIFICATIONS)
  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100 hover:text-green-600 rounded-full transition-colors">
          <BellIcon className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Thông báo</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              className="text-[10px] font-bold text-green-600 hover:text-green-700 h-auto p-0"
              onClick={markAllAsRead}
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "px-4 py-3 flex gap-3 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50/80",
                    !n.read && "bg-green-50/30"
                  )}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className={cn(
                    "size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    n.type === "warning" && "bg-orange-100 text-orange-600",
                    n.type === "success" && "bg-green-100 text-green-600",
                    n.type === "info" && "bg-blue-100 text-blue-600",
                    n.type === "error" && "bg-red-100 text-red-600",
                  )}>
                    {n.type === "warning" && <AlertTriangleIcon className="size-4" />}
                    {n.type === "success" && <CheckIcon className="size-4" />}
                    {n.type === "info" && <InfoIcon className="size-4" />}
                    {n.type === "error" && <XIcon className="size-4" />}
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <p className={cn("text-xs font-bold text-slate-800", !n.read && "text-green-900")}>{n.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{n.description}</p>
                    <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      <ClockIcon className="size-3" />
                      {n.time}
                    </div>
                  </div>
                  {!n.read && (
                    <div className="size-1.5 bg-green-500 rounded-full shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <BellIcon className="size-10 text-slate-200 mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Không có thông báo mới</p>
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-slate-100 bg-slate-50/50">
          <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-green-600 h-8">
            Xem tất cả thông báo
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
