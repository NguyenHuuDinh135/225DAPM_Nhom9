"use client";

import * as React from "react";
import { Map, MapMarker, MarkerContent, MapPopup, MapControls } from "@workspace/ui/components/ui/map";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Wrench, CheckCircle2, Clock, X, MapPin, UserCircle, Calendar, ArrowRight } from "lucide-react";

// DỮ LIỆU GIẢ LẬP
const generateTasks = (count: number) => {
  const titles = ["Cắt tỉa cành rễ", "Bón phân định kỳ", "Khảo sát sâu bệnh", "Trồng cây thay thế", "Phun thuốc trừ sâu", "Gia cố mùa mưa"];
  const assignees = ["Trần Minh Tuấn", "Nguyễn Mai Anh", "Lê Văn Hải", "Chưa phân công"];
  const statuses = ["Hoàn thành", "Đang xử lý", "Chưa bắt đầu"];

  return Array.from({ length: count }).map((_, i) => ({
    id: `TASK-${i}`,
    title: titles[Math.floor(Math.random() * titles.length)],
    assignee: assignees[Math.floor(Math.random() * assignees.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lng: 108.195 + Math.random() * 0.035,
    lat: 16.045 + Math.random() * 0.025,
    date: "15/10/2026",
  }));
};

const TASK_MOCK_DATA = generateTasks(40);

export function TaskMap() {
  const [selectedTask, setSelectedTask] = React.useState<typeof TASK_MOCK_DATA[0] | null>(null);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Hoàn thành":
        return { color: "bg-emerald-500", border: "border-emerald-700", icon: <CheckCircle2 className="size-4 text-white" /> };
      case "Đang xử lý":
        return { color: "bg-amber-500", border: "border-amber-700", icon: <Wrench className="size-4 text-white" /> };
      default:
        return { color: "bg-slate-400", border: "border-slate-600", icon: <Clock className="size-4 text-white" /> };
    }
  };

  return (
    <div className="absolute inset-0 z-10 bg-muted/10">
      <Map
        center={[108.21, 16.06]}
        zoom={13.5}
        className="w-full h-full relative"
      >
        <MapControls position="top-right" showCompass showLocate showZoom />

        {/* 1. RENDER CÁC MARKER */}
        {TASK_MOCK_DATA.map((task) => {
          const config = getStatusConfig(task.status || "Chưa bắt đầu");
          return (
            <MapMarker
              key={task.id}
              longitude={task.lng}
              latitude={task.lat}
            >
              <MarkerContent>
                {/* ĐẶT ONCLICK Ở ĐÂY LÀ CHUẨN NHẤT */}
                <div
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn click rớt xuống bản đồ nền
                    setSelectedTask(task); // Set state để mở Popup
                  }}
                  className={`flex items-center justify-center size-8 rounded-full shadow-lg border-2 cursor-pointer transition-all duration-200 hover:scale-125 hover:shadow-xl ${config.color} ${config.border} ${selectedTask?.id === task.id ? 'ring-4 ring-primary/30 scale-125' : ''}`}
                >
                  {config.icon}
                </div>
              </MarkerContent>
            </MapMarker>
          );
        })}

        {/* 2. RENDER POPUP CHI TIẾT KHI CÓ NODE ĐƯỢC CLICK */}
        {selectedTask && (
          <MapPopup
            longitude={selectedTask.lng}
            latitude={selectedTask.lat}
            onClose={() => setSelectedTask(null)}
            closeButton={false}
            anchor="bottom"
            offset={25}
            className="z-50 p-0 overflow-hidden rounded-xl shadow-2xl border border-border w-[320px] bg-background"
          >
            <div className="flex flex-col">
              {/* Header Popup */}
              <div className="flex items-start justify-between p-4 border-b bg-muted/40">
                <div className="flex flex-col gap-2">
                  <Badge 
                    variant="outline" 
                    className={`w-fit text-[10px] border font-semibold ${
                      selectedTask.status === "Hoàn thành" ? "text-emerald-600 border-emerald-600 bg-emerald-50" : 
                      selectedTask.status === "Đang xử lý" ? "text-amber-600 border-amber-600 bg-amber-50" : 
                      "text-slate-600 border-slate-600 bg-slate-50"
                    }`}
                  >
                    {selectedTask.status}
                  </Badge>
                  <h3 className="text-[15px] font-bold text-foreground leading-tight">{selectedTask.title}</h3>
                </div>
                <X 
                  className="size-5 p-0.5 text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted rounded-md shrink-0 transition-colors" 
                  onClick={() => setSelectedTask(null)} 
                />
              </div>

              {/* Body Popup */}
              <div className="p-4 flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <MapPin className="size-4 text-primary" />
                  <span className="truncate">Quận Hải Châu, Đà Nẵng</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <UserCircle className="size-4 text-primary" />
                  <span className={selectedTask.assignee === "Chưa phân công" ? "text-destructive italic" : "font-medium text-foreground"}>
                    {selectedTask.assignee}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Calendar className="size-4 text-primary" />
                  <span>Hạn chót: <span className="font-medium text-foreground">{selectedTask.date}</span></span>
                </div>
              </div>

              {/* Footer Popup - Nút hành động */}
              <div className="p-3 border-t bg-muted/20 flex justify-end">
                <Button size="sm" className="h-8 w-full text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Xem tiến độ chi tiết
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </MapPopup>
        )}
      </Map>

      {/* CHÚ THÍCH */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-md border border-border p-3.5 rounded-xl shadow-lg flex flex-col gap-2.5 z-20 pointer-events-none">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
          <div className="flex items-center justify-center size-5 bg-emerald-500 rounded-full border border-emerald-700 shadow-sm"><CheckCircle2 className="size-3 text-white"/></div> 
          Hoàn thành
        </div>
        <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
          <div className="flex items-center justify-center size-5 bg-amber-500 rounded-full border border-amber-700 shadow-sm"><Wrench className="size-3 text-white"/></div> 
          Đang xử lý
        </div>
        <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
          <div className="flex items-center justify-center size-5 bg-slate-400 rounded-full border border-slate-600 shadow-sm"><Clock className="size-3 text-white"/></div> 
          Chưa bắt đầu
        </div>
      </div>
    </div>
  );
}