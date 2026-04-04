"use client";

import * as React from "react";
import {
  Map,
  MapMarker,
  MapPopup,
  MapRoute,
  MapControls,
  type MapRef,
} from "@workspace/ui/components/ui/map"; 
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { TreePine, Leaf, AlertTriangle, MapPin, Search, Filter, Navigation } from "lucide-react";

// Dữ liệu mock (Thêm vài cây để demo scroll)
const trees = [
  { id: "CX-001", name: "Cây Phượng Vĩ", species: "Delonix regia", longitude: 108.1535, latitude: 16.0755, status: "healthy", age: 15 },
  { id: "CX-002", name: "Cây Bàng Đài Loan", species: "Terminalia mantaly", longitude: 108.1542, latitude: 16.0750, status: "needs_care", age: 5 },
  { id: "CX-003", name: "Cây Lim Xẹt", species: "Peltophorum pterocarpum", longitude: 108.1528, latitude: 16.0762, status: "healthy", age: 8 },
  { id: "CX-004", name: "Cây Xà Cừ", species: "Khaya senegalensis", longitude: 108.1550, latitude: 16.0740, status: "healthy", age: 20 },
  { id: "CX-005", name: "Cây Bằng Lăng", species: "Lagerstroemia speciosa", longitude: 108.1520, latitude: 16.0770, status: "needs_care", age: 12 },
];

const patrolRoute = trees.map((t) => [t.longitude, t.latitude] as [number, number]);

export default function TreeMapDemoPage() {
  const [selectedTree, setSelectedTree] = React.useState<typeof trees[0] | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Ref để điều khiển bản đồ từ bên ngoài (flyTo)
  const mapRef = React.useRef<MapRef>(null);

  const filteredTrees = trees.filter(tree => 
    tree.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tree.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hàm xử lý khi click vào 1 cây bên danh sách
  const handleFocusTree = (tree: typeof trees[0]) => {
    setSelectedTree(tree);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [tree.longitude, tree.latitude],
        zoom: 18.5, // Zoom cận cảnh
        pitch: 45, // Nghiêng camera 3D một chút cho đẹp
        duration: 1500, // Hiệu ứng bay trong 1.5s
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-lg m-4">
      {/* Header Panel */}
      <div className="p-4 border-b z-20 flex justify-between items-center bg-card shadow-sm">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TreePine className="h-6 w-6 text-primary" />
            </div>
            Hệ Thống Quản Lý Cây Xanh
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Khu vực: Khuôn viên Đại học Sư Phạm Kỹ Thuật Đà Nẵng
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">Tổng số cây: {trees.length}</span>
            <span className="text-xs text-muted-foreground">Cập nhật lúc 08:00 AM</span>
          </div>
        </div>
      </div>

      {/* Main Content: Split Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar: Data List */}
        <div className="w-96 flex flex-col border-r bg-card/50 backdrop-blur-sm z-10 shadow-xl">
          <div className="p-4 border-b space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm mã cây, tên cây..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors border-primary/50 text-primary flex items-center gap-1 flex-1 justify-center py-1">
                <Leaf className="w-3 h-3" /> Tốt ({trees.filter(t => t.status === 'healthy').length})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-destructive/10 transition-colors border-destructive/50 text-destructive flex items-center gap-1 flex-1 justify-center py-1">
                <AlertTriangle className="w-3 h-3" /> Cần khám ({trees.filter(t => t.status === 'needs_care').length})
              </Badge>
              <Button variant="outline" size="icon" className="h-7 w-7 shrink-0">
                <Filter className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {filteredTrees.map((tree) => (
                <div
                  key={tree.id}
                  onClick={() => handleFocusTree(tree)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    selectedTree?.id === tree.id 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{tree.name}</h3>
                      <p className="text-xs text-muted-foreground italic">{tree.species}</p>
                    </div>
                    <Badge variant={tree.status === "healthy" ? "secondary" : "destructive"} className="text-[10px]">
                      {tree.id}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-3">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Khu A
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1">
                      <Navigation className="h-3 w-3" /> Vị trí
                    </Button>
                  </div>
                </div>
              ))}
              {filteredTrees.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Không tìm thấy cây nào phù hợp.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Content: Map */}
        <div className="flex-1 relative w-full h-full bg-muted/20">
          <Map
            ref={mapRef}
            center={[108.1535, 16.0755]} 
            zoom={16.5}
            className="w-full h-full"
          >
            <MapControls position="bottom-right" showCompass showLocate />

            {/* Markers */}
            {trees.map((tree) => (
              <MapMarker
                key={tree.id}
                longitude={tree.longitude}
                latitude={tree.latitude}
                onClick={(e: unknown) => {
                  const event = e as { originalEvent?: MouseEvent; stopPropagation?: () => void };
                  if (event.originalEvent && typeof event.originalEvent.stopPropagation === 'function') {
                    event.originalEvent.stopPropagation();
                  } else if (typeof event.stopPropagation === 'function') {
                    event.stopPropagation();
                  }
                  handleFocusTree(tree); // Dùng chung hàm focus để bay map tới luôn
                }}
                className={`cursor-pointer transition-all duration-300 z-10 ${
                  selectedTree?.id === tree.id ? "scale-125 z-20" : "hover:scale-110"
                }`}
              >
                <div
                  className={`p-2 rounded-full shadow-lg border-2 bg-background backdrop-blur-sm ${
                    tree.status === "healthy"
                      ? "border-primary text-primary"
                      : "border-destructive text-destructive animate-pulse"
                  } ${selectedTree?.id === tree.id ? "ring-4 ring-primary/20" : ""}`}
                >
                  <TreePine className="h-5 w-5" />
                </div>
              </MapMarker>
            ))}

            {/* Popups */}
            {selectedTree && (
              <MapPopup
                longitude={selectedTree.longitude}
                latitude={selectedTree.latitude}
                onClose={() => setSelectedTree(null)}
                closeButton={false}
                anchor="bottom"
                offset={25}
                className="z-50 bg-transparent shadow-none border-none p-0" 
              >
                <Card className="w-80 border-border shadow-2xl overflow-hidden bg-card/95 backdrop-blur-md">
                  <div className="h-1 w-full bg-gradient-to-r from-primary to-green-400" />
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">{selectedTree.name}</span>
                        <Badge variant="outline" className="bg-background">
                          {selectedTree.id}
                        </Badge>
                      </div>
                      <span className="text-xs italic text-muted-foreground font-normal">
                        {selectedTree.species}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-sm grid gap-3">
                    <div className="grid grid-cols-2 gap-2 bg-muted/50 p-2 rounded-md">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Tuổi đời</span>
                        <span className="font-medium">{selectedTree.age} năm</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Trạng thái</span>
                        <span className={`font-medium ${selectedTree.status === "healthy" ? "text-primary" : "text-destructive"}`}>
                          {selectedTree.status === "healthy" ? "Phát triển tốt" : "Sâu bệnh"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="flex-1 h-8 text-xs">
                        Tạo công việc
                      </Button>
                      <Button size="sm" variant="secondary" className="flex-1 h-8 text-xs">
                        Chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </MapPopup>
            )}

            <MapRoute
              coordinates={patrolRoute}
              color="hsl(var(--primary))" 
              width={3}
              opacity={0.5}
              dashArray={[2, 4]}
            />
          </Map>
        </div>
      </div>
    </div>
  );
}