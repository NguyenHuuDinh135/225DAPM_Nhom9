"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Map, MapMarker, MarkerContent, MapPopup, MapControls } from "@workspace/ui/components/ui/map";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Wrench, CheckCircle2, Clock, X, MapPin, Calendar, ArrowRight, AlertCircle } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type WorkStatus = "New" | "InProgress" | "WaitingForApproval" | "Completed" | "Cancelled";

interface WorkTreeLocation { treeId: number; treeName: string | null; latitude: number; longitude: number }
interface WorkItem {
  id: number; workTypeName: string | null; planName: string | null;
  startDate: string | null; endDate: string | null;
  status: WorkStatus; statusName: string;
  treeLocations: WorkTreeLocation[];
}

// Flatten work-items into per-tree markers
interface WorkMarker {
  workId: number; treeId: number; treeName: string | null;
  workTypeName: string | null; planName: string | null;
  startDate: string | null; endDate: string | null;
  status: WorkStatus; statusName: string;
  lat: number; lng: number;
}

const STATUS_CONFIG: Record<WorkStatus, { color: string; border: string; icon: React.ReactNode; badgeClass: string }> = {
  New:                 { color: "bg-slate-400",   border: "border-slate-600",   icon: <Clock className="size-3.5 text-white" />,        badgeClass: "text-slate-600 border-slate-400 bg-slate-50" },
  InProgress:          { color: "bg-amber-500",   border: "border-amber-700",   icon: <Wrench className="size-3.5 text-white" />,       badgeClass: "text-amber-600 border-amber-500 bg-amber-50" },
  WaitingForApproval:  { color: "bg-purple-500",  border: "border-purple-700",  icon: <AlertCircle className="size-3.5 text-white" />,  badgeClass: "text-purple-600 border-purple-500 bg-purple-50" },
  Completed:           { color: "bg-emerald-500", border: "border-emerald-700", icon: <CheckCircle2 className="size-3.5 text-white" />, badgeClass: "text-emerald-600 border-emerald-500 bg-emerald-50" },
  Cancelled:           { color: "bg-red-400",     border: "border-red-600",     icon: <X className="size-3.5 text-white" />,            badgeClass: "text-red-600 border-red-400 bg-red-50" },
};

export function TaskMap() {
  const router = useRouter();
  const [markers, setMarkers] = React.useState<WorkMarker[]>([]);
  const [selected, setSelected] = React.useState<WorkMarker | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${BASE_URL}/api/work-items`, { headers })
      .then((r) => r.ok ? r.json() : { workItems: [] })
      .then((d: { workItems: WorkItem[] }) => {
        const flat: WorkMarker[] = [];
        for (const w of d.workItems) {
          for (const loc of w.treeLocations) {
            flat.push({
              workId: w.id, treeId: loc.treeId, treeName: loc.treeName,
              workTypeName: w.workTypeName, planName: w.planName,
              startDate: w.startDate, endDate: w.endDate,
              status: w.status, statusName: w.statusName,
              lat: loc.latitude, lng: loc.longitude,
            });
          }
        }

        if (flat.length > 0) {
          setMarkers(flat);
          setLoading(false);
        } else {
          // Fallback: show all trees from map endpoint
          fetch(`${BASE_URL}/api/trees/map`, { headers })
            .then((r) => r.ok ? r.json() : { trees: [] })
            .then((td: { trees: { id: number; name: string | null; latitude: number | null; longitude: number | null }[] }) => {
              const fallback: WorkMarker[] = td.trees
                .filter((t) => t.latitude != null && t.longitude != null)
                .map((t) => ({
                  workId: 0, treeId: t.id, treeName: t.name,
                  workTypeName: "Cây xanh", planName: null,
                  startDate: null, endDate: null,
                  status: "New" as WorkStatus, statusName: "Cây xanh",
                  lat: t.latitude!, lng: t.longitude!,
                }));
              setMarkers(fallback);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        }
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="absolute inset-0 z-10 bg-muted/10">
      <Map center={[108.21, 16.06]} zoom={13.5} loading={loading} className="w-full h-full relative">
        <MapControls position="top-right" showCompass showLocate showZoom />

        {markers.map((m, i) => {
          const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.New;
          return (
            <MapMarker key={`${m.workId}-${m.treeId}-${i}`} longitude={m.lng} latitude={m.lat}>
              <MarkerContent>
                <div
                  onClick={(e) => { e.stopPropagation(); setSelected(m); }}
                  className={`flex items-center justify-center size-7 rounded-full shadow-md border-2 cursor-pointer transition-all duration-150 hover:scale-125 ${cfg.color} ${cfg.border} ${selected?.workId === m.workId && selected?.treeId === m.treeId ? "ring-4 ring-primary/30 scale-125" : ""}`}
                >
                  {cfg.icon}
                </div>
              </MarkerContent>
            </MapMarker>
          );
        })}

        {selected && (() => {
          const cfg = STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.New;
          return (
            <MapPopup
              longitude={selected.lng} latitude={selected.lat}
              onClose={() => setSelected(null)} closeButton={false}
              anchor="bottom" offset={25}
              className="z-50 p-0 overflow-hidden rounded-xl shadow-2xl border border-border w-[300px] bg-background"
            >
              <div className="flex flex-col">
                <div className="flex items-start justify-between p-3 border-b bg-muted/40">
                  <div className="flex flex-col gap-1.5">
                    <Badge variant="outline" className={`w-fit text-[10px] border font-semibold ${cfg.badgeClass}`}>
                      {selected.statusName}
                    </Badge>
                    <h3 className="text-[14px] font-bold text-foreground leading-tight">{selected.workTypeName ?? "Công tác"}</h3>
                  </div>
                  <X className="size-4 text-muted-foreground cursor-pointer hover:text-foreground shrink-0 mt-0.5" onClick={() => setSelected(null)} />
                </div>
                <div className="p-3 flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">Cây #{selected.treeId}{selected.treeName ? ` — ${selected.treeName}` : ""}</span>
                  </div>
                  {selected.planName && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wrench className="size-3.5 text-primary shrink-0" />
                      <span className="truncate">{selected.planName}</span>
                    </div>
                  )}
                  {(selected.startDate || selected.endDate) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      <span className="text-xs">
                        {selected.startDate ? new Date(selected.startDate).toLocaleDateString("vi-VN") : "?"}
                        {" → "}
                        {selected.endDate ? new Date(selected.endDate).toLocaleDateString("vi-VN") : "?"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t bg-muted/20">
                  <Button size="sm" className="h-8 w-full text-xs gap-1.5"
                    onClick={() => router.push(`/works/${selected.workId}`)}>
                    Xem chi tiết công tác
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </MapPopup>
          );
        })()}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-md border border-border p-3 rounded-xl shadow-lg flex flex-col gap-2 z-20 pointer-events-none text-xs font-medium">
        {(["New", "InProgress", "WaitingForApproval", "Completed", "Cancelled"] as WorkStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const label = { New: "Mới", InProgress: "Đang xử lý", WaitingForApproval: "Chờ duyệt", Completed: "Hoàn thành", Cancelled: "Đã hủy" }[s];
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center justify-center size-5 rounded-full border ${cfg.color} ${cfg.border} shadow-sm`}>{cfg.icon}</div>
              {label}
            </div>
          );
        })}
      </div>

      {markers.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-muted-foreground border border-border">
            Chưa có dữ liệu cây trên bản đồ
          </div>
        </div>
      )}
    </div>
  );
}
