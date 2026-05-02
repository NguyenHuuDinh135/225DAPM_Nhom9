"use client";

import * as React from "react";
import Link from "next/link";
import { Map, MapMarker, MarkerContent, MapPopup, MapControls, type MapRef } from "@workspace/ui/components/ui/map";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { 
  TreePine, Wrench, AlertCircle, Search, 
  MapPin, Maximize2, Minimize2, 
  Move, Activity, User, Trash2, Check, X,
  Briefcase, ShieldCheck, RefreshCw, Sparkles
} from "lucide-react";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { apiClient, getImageUrl } from "@/lib/api-client";
import { toast } from "@workspace/ui/components/sonner";
import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/lib/roles";
import { AutoPlanDialog } from "../plans/components/auto-plan-dialog";
import { cn } from "@workspace/ui/lib/utils";
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle,
    SheetDescription 
} from "@workspace/ui/components/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

interface TreeMapDto { 
  id: number; 
  name: string | null; 
  condition: string | null; 
  treeTypeName: string | null; 
  treeTypeId: number;
  latitude: number | null; 
  longitude: number | null;
  address?: string;
  mainImageUrl?: string;
}

interface IncidentMapDto {
  id: number;
  treeId: number;
  treeName: string | null;
  description: string | null;
  status: string;
  severity: string;
  latitude: number;
  longitude: number;
}

interface WorkItemMapDto {
  id: number;
  workType: string;
  status: string;
  assignedToName: string;
  latitude: number;
  longitude: number;
}

const CONDITION_COLORS: Record<string, string> = {
  "Tốt": "bg-primary",
  "Bình thường": "bg-blue-500",
  "Cần cắt tỉa": "bg-amber-500",
  "Sâu bệnh": "bg-destructive",
  "Mới trồng": "bg-cyan-500",
};

export function FullDashboardMap() {
  const { user } = useAuth();
  const isAdmin = user && (user.role === ROLES.DoiTruong || user.role === ROLES.GiamDoc);
  const isStaff = user && (user.role === ROLES.NhanVien || isAdmin);
  
  const mapRef = React.useRef<MapRef>(null);
  const [trees, setTrees] = React.useState<TreeMapDto[]>([]);
  const [incidents, setIncidents] = React.useState<IncidentMapDto[]>([]);
  const [workItems, setWorkItems] = React.useState<WorkItemMapDto[]>([]);
  const [treeTypes, setTreeTypes] = React.useState<any[]>([]);
  const [teams, setTeams] = React.useState<any[]>([]);
  
  const [loading, setLoading] = React.useState(true);
  const [selectedTree, setSelectedTree] = React.useState<TreeMapDto | null>(null);
  const [selectedIncident, setSelectedIncident] = React.useState<IncidentMapDto | null>(null);
  const [selectedWorkItem, setSelectedWorkItem] = React.useState<WorkItemMapDto | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [autoPlanOpen, setAutoPlanOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeMode, setActiveMode] = React.useState<"view" | "add-tree" | "relocate">("view");

  const [showTrees, setShowTrees] = React.useState(true);
  const [showIncidents, setShowIncidents] = React.useState(true);
  const [showWorkItems, setShowWorkItems] = React.useState(true);
  const [showAiLayer, setShowAiLayer] = React.useState(false);
  const [aiSuggestions, setAiSuggestions] = React.useState<number[]>([]);

  const stats = React.useMemo(() => ({
    totalTrees: trees.length,
    sickTrees: trees.filter(t => t.condition === "Sâu bệnh").length,
    pendingIncidents: incidents.filter(i => i.status === "Pending").length,
    activeWorks: workItems.filter(w => w.status !== "Completed").length
  }), [trees, incidents, workItems]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [treeRes, incidentRes, workRes, typeRes, employeeRes] = await Promise.all([
        apiClient.get<any>("/api/trees/map"),
        apiClient.get<any>("/api/tree-incidents"),
        apiClient.get<any>("/api/work-items"),
        apiClient.get<any>("/api/lookups/tree-types"),
        apiClient.get<any>("/api/employees")
      ]);
      
      setTrees((treeRes?.trees || treeRes?.items || treeRes || []).filter((t: any) => t.latitude != null));
      setIncidents((incidentRes?.treeIncidents || incidentRes?.items || incidentRes || []).filter((i: any) => i.latitude != null));
      
      const works = (workRes?.workItems || workRes?.items || workRes || []).map((w: any) => ({
        id: w.id,
        workType: w.workTypeName,
        status: w.status,
        assignedToName: w.assignedUsers?.[0]?.userName,
        latitude: w.treeLocations?.[0]?.latitude,
        longitude: w.treeLocations?.[0]?.longitude
      })).filter((w: any) => w.latitude != null);
      setWorkItems(works);
      
      setTreeTypes(typeRes || []);
      const allEmployees = employeeRes?.employees || [];
      setTeams(allEmployees.filter((e: any) => e.role === "DoiTruong").map((e: any) => ({
          id: e.id,
          name: e.fullName || e.userName
      })));
    } catch (err: any) {
      console.error("LoadData Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAiSuggestions = async () => {
    if (showAiLayer) { setShowAiLayer(false); return; }
    try {
      const res = await apiClient.get<any>("/api/planning/ai-suggestions");
      setAiSuggestions(res?.suggestedTreeIds || []);
      setShowAiLayer(true);
      toast.success(res?.message || `AI phát hiện ${res?.suggestedTreeIds?.length || 0} mục tiêu bảo trì.`, {
          icon: <Sparkles className="size-4 text-primary" />,
          action: { label: "XEM", onClick: () => {} }
      });
    } catch (err: any) { 
      toast.error(`Lỗi kết nối AI: ${err.message || "Không có quyền truy cập"}`); 
    }
  };

  React.useEffect(() => { loadData(); }, [loadData]);

  const handleUpdateTree = async (id: number, data: any) => {
    try {
      // Use JSON for simple updates, unless it's a file upload (which this page doesn't do yet)
      await apiClient.put(`/api/trees/${id}`, {
          id,
          name: data.name,
          condition: data.condition,
          height: data.height,
          trunkDiameter: data.trunkDiameter
      });
      
      // Update local state immediately
      setTrees(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
      if (selectedTree?.id === id) {
          setSelectedTree(prev => prev ? { ...prev, ...data } : null);
      }
      
      toast.success("Cập nhật thông tin thành công");
      loadData(); // Sync with server
    } catch (err: any) { 
      toast.error(`Cập nhật thất bại: ${err.message || "Lỗi không xác định"}`); 
    }
  };

  const handleApproveIncident = async (id: number, teamId?: string) => {
    try {
        const promise = apiClient.put(`/api/tree-incidents/${id}/approve`, { id, approverId: user?.id || "", teamId });
        await toast.promise(promise, {
            loading: "Đang phê duyệt sự cố...",
            success: "Đã phê duyệt & điều phối",
            error: "Lỗi phê duyệt",
        });
        loadData();
        setSelectedIncident(null);
    } catch (err) {}
  };

  const [rejectFeedback, setRejectFeedback] = React.useState("");

  const handleApproveWork = async (id: number, isApproved: boolean) => {
    if (!isApproved && !rejectFeedback) {
        toast.error("Vui lòng nhập lý do từ chối");
        return;
    }

    try {
        const promise = apiClient.put(`/api/work-items/${id}/approve`, { 
            workItemId: id, 
            isApproved,
            feedback: isApproved ? null : rejectFeedback
        });
        
        await toast.promise(promise, {
            loading: "Đang xử lý nghiệp vụ...",
            success: () => isApproved ? "Duyệt hoàn thành thành công" : "Đã bác bỏ công việc",
            error: "Thao tác thất bại"
        });
        
        setRejectFeedback("");
        loadData();
        setSelectedWorkItem(null);
    } catch (err) {}
  };

  const handleMapClick = (e: any) => {
    if (activeMode !== "add-tree") return;
    const { lng, lat } = e.lngLat;
    toast("Xác nhận thêm cây mới?", {
      description: `Vị trí: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      action: {
        label: "THÊM",
        onClick: async () => {
          try {
              const newId = await apiClient.post<number>("/api/trees", { 
                  name: "Cây mới", 
                  latitude: lat, 
                  longitude: lng, 
                  treeTypeId: treeTypes[0]?.id || 1 
              });
              
              // Add to local state immediately so it shows up
              const newTree: TreeMapDto = {
                  id: newId,
                  name: "Cây mới",
                  latitude: lat,
                  longitude: lng,
                  condition: "Tốt",
                  treeTypeId: treeTypes[0]?.id || 1,
                  treeTypeName: treeTypes[0]?.name || "N/A"
              };
              setTrees(prev => [...prev, newTree]);
              setActiveMode("view");
              toast.success("Thêm cây thành công");
              loadData();
          } catch (err) {
              toast.error("Lỗi thêm cây");
          }
        }
      }
    });
  };

  const handleDragEnd = async (id: number, lngLat: { lng: number; lat: number }) => {
    try {
        const promise = apiClient.put(`/api/trees/${id}/relocate`, { id, latitude: lngLat.lat, longitude: lngLat.lng });
        await toast.promise(promise, {
            loading: "Đang lưu tọa độ mới...",
            success: "Đã di dời cây",
            error: "Thất bại"
        });
        
        // Update local state
        setTrees(prev => prev.map(t => t.id === id ? { ...t, latitude: lngLat.lat, longitude: lngLat.lng } : t));
        loadData();
    } catch (err) {}
  };

  const filteredTrees = trees.filter(t => !searchQuery || t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toString() === searchQuery);

  return (
    <div className={cn(
        "relative w-full overflow-hidden transition-all duration-700 bg-background border shadow-2xl rounded-[3rem]",
        isFullscreen ? "fixed inset-0 z-[100]" : "h-[calc(100vh-var(--header-height)-1.5rem)]"
    )}>
      <AutoPlanDialog open={autoPlanOpen} onOpenChange={setAutoPlanOpen} onSuccess={() => loadData()} />
      
      {/* Heads-up Display (HUD) */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-4 pointer-events-none w-full max-w-sm">
        <div className="flex gap-2 bg-card/95 backdrop-blur-xl p-2.5 rounded-2xl border border-border shadow-2xl pointer-events-auto">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input 
                    placeholder="Tìm ID hoặc tên thực thể..." 
                    className="pl-10 h-11 border-none bg-transparent focus-visible:ring-0 text-sm font-bold"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 hover:bg-primary/10 hover:text-primary" onClick={() => loadData()}>
                <RefreshCw className={cn("size-5", loading && "animate-spin")} />
            </Button>
        </div>

        <div className="flex gap-1.5 bg-card/95 backdrop-blur-xl p-2 rounded-2xl border border-border shadow-2xl pointer-events-auto self-start">
            <ModeButton label="Duyệt" active={activeMode === "view"} onClick={() => setActiveMode("view")} />
            {isStaff && (
                <>
                    <ModeButton label="+ Cây" active={activeMode === "add-tree"} onClick={() => setActiveMode("add-tree")} icon={TreePine} color="text-primary" />
                    <ModeButton label="Di dời" active={activeMode === "relocate"} onClick={() => setActiveMode("relocate")} icon={Move} color="text-blue-600" />
                </>
            )}
            <Button variant={showAiLayer ? "secondary" : "ghost"} size="sm" className={cn("rounded-xl h-9 px-4 font-black text-[10px] uppercase tracking-wider transition-all", showAiLayer && "text-primary bg-primary/10 shadow-inner")} onClick={loadAiSuggestions}>
                <Sparkles className="size-3.5 mr-1.5" /> AI
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </Button>
        </div>
      </div>

      {/* Layers Controls */}
      <div className="absolute top-6 right-6 z-20 bg-card/95 backdrop-blur-xl p-5 rounded-[2.5rem] border border-border shadow-2xl w-48 space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 px-1">Lớp hiển thị</h4>
        <div className="space-y-1.5">
            <LayerItem label="Cây xanh" checked={showTrees} onCheck={setShowTrees} color="bg-primary" />
            <LayerItem label="Sự cố" checked={showIncidents} onCheck={setShowIncidents} color="bg-destructive" />
            <LayerItem label="Thi công" checked={showWorkItems} onCheck={setShowWorkItems} color="bg-blue-600" />
        </div>
      </div>

      {/* Map Implementation */}
      <div className="flex-1 relative h-full">
        <Map ref={mapRef} center={[108.2149, 16.0644]} zoom={14} loading={loading} className="w-full h-full" onClick={handleMapClick}>
          <MapControls position="bottom-right" />
          
          {showTrees && filteredTrees.map((t) => (
            <MapMarker key={`tree-${t.id}`} longitude={t.longitude!} latitude={t.latitude!} draggable={activeMode === "relocate"} onDragEnd={(lngLat) => handleDragEnd(t.id, lngLat)} onClick={() => setSelectedTree(t)}>
              <MarkerContent>
                <div className="relative group">
                    <div className={cn(
                        "size-3.5 rounded-full border-2 border-white shadow-xl transition-all hover:scale-150",
                        CONDITION_COLORS[t.condition ?? ""] ?? "bg-slate-400",
                        selectedTree?.id === t.id && "scale-150 ring-4 ring-primary/20"
                    )} />
                    {showAiLayer && aiSuggestions.includes(t.id) && (
                        <div className="absolute -inset-2 rounded-full border-2 border-primary animate-ping opacity-75" />
                    )}
                </div>
              </MarkerContent>
            </MapMarker>
          ))}

          {showIncidents && incidents.map((inc) => (
            <MapMarker key={`inc-${inc.id}`} longitude={inc.longitude} latitude={inc.latitude} onClick={() => setSelectedIncident(inc)}>
              <MarkerContent>
                <div className="size-7 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-2xl animate-bounce border-2 border-white cursor-pointer hover:scale-125 transition-transform"><AlertCircle className="size-4" /></div>
              </MarkerContent>
            </MapMarker>
          ))}

          {showWorkItems && workItems.map((work) => (
            <MapMarker key={`work-${work.id}`} longitude={work.longitude} latitude={work.latitude} onClick={() => setSelectedWorkItem(work)}>
              <MarkerContent>
                <div className={cn(
                    "size-7 flex items-center justify-center rounded-full shadow-2xl border-2 border-white cursor-pointer hover:scale-125 transition-transform",
                    work.status === "Completed" ? "bg-primary text-white" : "bg-blue-600 text-white"
                )}>{work.status === "Completed" ? <Check className="size-4" /> : <Wrench className="size-4" />}</div>
              </MarkerContent>
            </MapMarker>
          ))}

          {/* REAL-TIME OPERATIONS POPUPS */}
          {selectedTree && (
            <MapPopup longitude={selectedTree.longitude!} latitude={selectedTree.latitude!} onClose={() => setSelectedTree(null)} className="w-[450px] overflow-hidden rounded-[3rem] border-none p-0 shadow-2xl">
              <div className="bg-card flex flex-col">
                {selectedTree.mainImageUrl && <div className="h-48 w-full shadow-inner"><img src={getImageUrl(selectedTree.mainImageUrl)} className="h-full w-full object-cover" /></div>}
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="w-fit font-black text-[10px] rounded-full px-3 border-border">HỒ SƠ CÂY #ID-{selectedTree.id}</Badge>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground leading-none">{selectedTree.name || "Cây xanh"}</h3>
                        </div>
                        <Select defaultValue={selectedTree.condition || "Tốt"} onValueChange={(val) => handleUpdateTree(selectedTree.id, { condition: val })}>
                            <SelectTrigger className="w-36 h-10 text-[11px] font-black uppercase rounded-full bg-muted/30 border-none shadow-inner">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                                {Object.keys(CONDITION_COLORS).map(c => <SelectItem key={c} value={c} className="text-xs font-bold uppercase">{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-[2rem] bg-muted/20 border border-border/50 space-y-1">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Loại cây</span>
                            <p className="font-black text-foreground text-sm leading-none truncate">{selectedTree.treeTypeName || "N/A"}</p>
                        </div>
                        <div className="p-4 rounded-[2rem] bg-muted/20 border border-border/50 space-y-1">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Vị trí</span>
                            <p className="font-black text-foreground text-sm leading-none truncate flex items-center gap-1.5"><MapPin className="size-3 text-primary" /> {selectedTree.address || "Đà Nẵng"}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Tên hiển thị</Label>
                            <Input 
                                defaultValue={selectedTree.name || ""} 
                                className="h-12 font-black text-base border-none bg-muted/30 focus-visible:ring-primary rounded-2xl shadow-inner px-5"
                                onBlur={(e) => handleUpdateTree(selectedTree.id, { name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black text-xs text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => {
                            toast.warning("Hủy bỏ dữ liệu cây?", { action: { label: "XÓA", onClick: async () => { await apiClient.delete(`/api/trees/${selectedTree.id}`); loadData(); setSelectedTree(null); } } });
                        }}><Trash2 className="size-5 mr-2" /> GỠ BỎ</Button>
                        <Button className="flex-[1.5] rounded-2xl h-14 font-black text-xs shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90" onClick={() => setIsSidebarOpen(true)}><Activity className="size-5 mr-2" /> CHI TIẾT LỊCH SỬ</Button>
                    </div>
                </div>
              </div>
            </MapPopup>
          )}

          {selectedIncident && (
            <MapPopup longitude={selectedIncident.longitude} latitude={selectedIncident.latitude} onClose={() => setSelectedIncident(null)} className="w-[400px] overflow-hidden rounded-[3rem] border-none p-0 shadow-2xl">
                <div className="bg-card p-8 space-y-6 border-t-[12px] border-destructive">
                    <div className="flex items-center justify-between">
                        <Badge variant="destructive" className="font-black uppercase italic px-5 h-7 rounded-full shadow-lg shadow-destructive/20">Sự cố khẩn cấp</Badge>
                        <span className="text-[10px] font-black text-muted-foreground">REF #{selectedIncident.id}</span>
                    </div>
                    
                    <div className="p-5 rounded-[2rem] bg-destructive/5 border border-destructive/10 space-y-2">
                        <span className="text-[10px] font-black text-destructive uppercase tracking-widest">Mô tả sự cố</span>
                        <p className="text-base font-black leading-tight text-foreground/90 italic">"{selectedIncident.description}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 px-1">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cây bị ảnh hưởng</span>
                            <p className="font-black text-foreground text-sm">{selectedIncident.treeName || "Cây xanh"}</p>
                        </div>
                        <div className="space-y-1 px-1 text-right">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Mức độ</span>
                            <p className="font-black text-destructive text-sm uppercase">{selectedIncident.severity}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Điều phối Đội trưởng xử lý</Label>
                        <Select onValueChange={(val) => handleApproveIncident(selectedIncident.id, val)}>
                            <SelectTrigger className="rounded-2xl h-14 font-black border-none bg-muted/30 shadow-inner px-5">
                                <SelectValue placeholder="Chọn nhân sự phụ trách..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                                {teams.map((t: any) => <SelectItem key={t.id} value={t.id} className="font-black text-xs uppercase">{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full bg-destructive hover:bg-destructive/90 rounded-2xl h-16 font-black shadow-2xl shadow-destructive/30 uppercase tracking-[0.2em] text-xs" onClick={() => handleApproveIncident(selectedIncident.id)}>DUYỆT XỬ LÝ TỨC THÌ</Button>
                </div>
            </MapPopup>
          )}

          {selectedWorkItem && (
            <MapPopup longitude={selectedWorkItem.longitude} latitude={selectedWorkItem.latitude} onClose={() => setSelectedWorkItem(null)} className="w-[420px] overflow-hidden rounded-[3rem] border-none p-0 shadow-2xl">
                <div className={cn(
                    "bg-card p-8 space-y-7 border-t-[12px]",
                    selectedWorkItem.status === "Completed" ? "border-primary" : "border-blue-600"
                )}>
                    <div className="flex items-center justify-between">
                        <Badge className={cn("font-black uppercase px-5 h-7 rounded-full shadow-lg", selectedWorkItem.status === "Completed" ? "bg-primary shadow-primary/20" : "bg-blue-600 shadow-blue-600/20")}>
                            {selectedWorkItem.status === "Completed" ? "Đã hoàn thành" : "Đang thực hiện"}
                        </Badge>
                        <span className="text-[10px] font-black text-muted-foreground">TASKID-#{selectedWorkItem.id}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className={cn("size-20 rounded-[2.5rem] flex items-center justify-center shadow-inner", selectedWorkItem.status === "Completed" ? "bg-primary/10 text-primary" : "bg-blue-50 text-blue-600")}>
                            {selectedWorkItem.status === "Completed" ? <ShieldCheck className="size-10" /> : <Wrench className="size-10" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-xl font-black uppercase tracking-tighter leading-none mb-2 truncate text-foreground">{selectedWorkItem.workType}</p>
                            <div className="flex flex-col gap-1.5">
                                <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5"><User className="size-3" /> Nhân sự: {selectedWorkItem.assignedToName || "Hệ thống"}</p>
                                <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5"><Activity className="size-3" /> Trạng thái: {selectedWorkItem.status}</p>
                            </div>
                        </div>
                    </div>
                    
                    {selectedWorkItem.status !== "Completed" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Ghi chú phản hồi (nếu từ chối)</Label>
                                <Input 
                                    placeholder="Lý do không duyệt..." 
                                    className="h-12 border-none bg-muted/30 rounded-2xl shadow-inner px-5 font-bold text-sm"
                                    value={rejectFeedback}
                                    onChange={(e) => setRejectFeedback(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Button className="bg-primary hover:bg-primary/90 rounded-2xl h-16 font-black shadow-xl shadow-primary/20 uppercase tracking-widest text-xs" onClick={() => handleApproveWork(selectedWorkItem.id, true)}><Check className="size-6 mr-2" /> CHẤP THUẬN</Button>
                                <Button variant="outline" className="rounded-2xl h-16 font-black border-destructive/20 text-destructive hover:bg-destructive/5 uppercase tracking-widest text-xs" onClick={() => handleApproveWork(selectedWorkItem.id, false)}><X className="size-6 mr-2" /> TỪ CHỐI</Button>
                            </div>
                        </div>
                    )}
                </div>
            </MapPopup>
          )}
        </Map>
      </div>

      {/* Analytics HUD */}
      <div className="absolute bottom-6 left-6 z-20 flex gap-4 pointer-events-none">
          <StatusCard icon={Activity} label="Hệ thống" value="Online" color="green" />
          <StatusCard icon={AlertCircle} label="Sự cố" value={stats.pendingIncidents.toString()} color="red" />
          <StatusCard icon={Briefcase} label="Công tác" value={stats.activeWorks.toString()} color="blue" />
      </div>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto rounded-l-[4rem] border-none shadow-2xl p-0">
          {selectedTree && (
            <div className="flex flex-col h-full">
              <div className="bg-primary p-10 text-primary-foreground relative">
                  <TreePine className="absolute top-10 right-10 size-40 opacity-10 rotate-12" />
                  <SheetHeader className="relative z-10">
                    <Badge className="w-fit bg-white/20 text-white border-none rounded-full px-5 mb-4 font-black text-[10px]">ID #{selectedTree.id}</Badge>
                    <SheetTitle className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">{selectedTree.name || "Cây xanh"}</SheetTitle>
                    <SheetDescription className="text-primary-100 font-bold opacity-80 mt-2">Dữ liệu hồ sơ & Lịch sử chăm sóc.</SheetDescription>
                  </SheetHeader>
              </div>
              <div className="flex-1 p-10 space-y-10 bg-slate-50">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="p-6 rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 space-y-1"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tình trạng</span><p className="font-black text-slate-800 text-xl leading-none">{selectedTree.condition || "Tốt"}</p></div>
                    <div className="p-6 rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 space-y-1"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chủng loại</span><p className="font-black text-slate-800 text-xl leading-none truncate">{selectedTree.treeTypeName || "N/A"}</p></div>
                  </div>
                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid grid-cols-2 rounded-2xl h-14 bg-slate-200/40 p-1.5"><TabsTrigger value="info" className="rounded-xl font-black text-[10px] uppercase">Hồ sơ kỹ thuật</TabsTrigger><TabsTrigger value="actions" className="rounded-xl font-black text-[10px] uppercase text-destructive">Tác vụ khẩn</TabsTrigger></TabsList>
                    <TabsContent value="info" className="space-y-8 mt-10">
                        <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-[6px] border-white bg-slate-200">{selectedTree.mainImageUrl && <img src={getImageUrl(selectedTree.mainImageUrl)} className="w-full h-full object-cover" />}</div>
                        <div className="p-7 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl flex justify-between items-center"><span className="text-xs font-black text-slate-400 uppercase">Vị trí thực tế</span><span className="text-xs font-black text-slate-700 italic">{selectedTree.address || "Đà Nẵng, Việt Nam"}</span></div>
                    </TabsContent>
                    <TabsContent value="actions" className="space-y-5 mt-10">
                        <Button variant="outline" className="w-full h-20 rounded-[2.2rem] font-black gap-4 text-destructive border-destructive/20 hover:bg-destructive/5 hover:border-destructive/40 shadow-xl transition-all" onClick={() => {
                            toast.warning("Hủy dữ liệu cây xanh?", { action: { label: "XÓA VĨNH VIỄN", onClick: async () => { await apiClient.delete(`/api/trees/${selectedTree.id}`); loadData(); setIsSidebarOpen(false); } } });
                        }}><Trash2 className="size-7" /> LOẠI BỎ KHỎI HỆ THỐNG</Button>
                    </TabsContent>
                  </Tabs>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <style jsx global>{`
        .mapboxgl-popup-content { padding: 0 !important; background: transparent !important; box-shadow: none !important; border: none !important; }
        .mapboxgl-popup-tip { border-top-color: hsl(var(--card)) !important; }
        [data-sonner-toast] { background: hsl(var(--background)) !important; border: 1px solid hsl(var(--border)) !important; border-radius: 2rem !important; padding: 1.25rem 1.5rem !important; font-weight: 900 !important; text-transform: uppercase !important; font-size: 11px !important; letter-spacing: 0.05em !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; }
        [data-sonner-toast] [data-button] { background: hsl(var(--primary)) !important; color: white !important; border-radius: 1rem !important; font-weight: 900 !important; padding: 0.5rem 1rem !important; }
      `}</style>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: "green" | "red" | "blue" }) {
    const colors = {
        green: "bg-primary/10 text-primary border-primary/20",
        red: "bg-destructive/10 text-destructive border-destructive/20",
        blue: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    };
    return (
        <div className={cn("bg-card/95 backdrop-blur-xl px-6 py-3.5 rounded-[1.8rem] border border-border shadow-2xl flex items-center gap-5 pointer-events-auto", colors[color])}>
            <div className="size-10 rounded-full bg-background/50 flex items-center justify-center shadow-inner"><Icon className="size-5 animate-pulse" /></div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1.5">{label}</span>
                <span className="text-lg font-black leading-none tracking-tighter">{value}</span>
            </div>
        </div>
    );
}

function ModeButton({ label, active, onClick, icon: Icon, color }: { label: string, active: boolean, onClick: () => void, icon?: any, color?: string }) {
    return (
        <Button variant={active ? "secondary" : "ghost"} size="sm" className={cn("rounded-2xl h-10 px-5 font-black text-[11px] uppercase tracking-wider transition-all", active && (color || "bg-muted shadow-inner"))} onClick={onClick}>
            {Icon && <Icon className="size-3.5 mr-2" />} {label}
        </Button>
    );
}

function LayerItem({ label, checked, onCheck, color }: { label: string, checked: boolean, onCheck: (v: boolean) => void, color: string }) {
    return (
        <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => onCheck(!checked)}>
            <div className="flex items-center gap-3">
                <div className={cn("size-3 rounded-full shadow-sm", checked ? color : "bg-slate-300")} />
                <Label className="text-xs font-black text-foreground/80 cursor-pointer">{label.toUpperCase()}</Label>
            </div>
            <Checkbox checked={checked} className="rounded-lg border-muted-foreground/30 data-[state=checked]:bg-primary transition-all" />
        </div>
    );
}
