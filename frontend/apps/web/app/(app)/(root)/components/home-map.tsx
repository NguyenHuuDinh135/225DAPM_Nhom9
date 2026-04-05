"use client";

import * as React from "react";
// ĐÃ FIX: Thêm MarkerContent vào import
import { Map, MapMarker, MarkerContent, MapPopup, MapControls } from "@workspace/ui/components/ui/map";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight, MoreHorizontal, X, List } from "lucide-react";

// HÀM TẠO 1000 DỮ LIỆU CÂY XANH TẠI ĐÀ NẴNG
const generateDenseTrees = (count: number) => {
  const speciesList = ["Lim xẹt cánh (Phượng vàng)", "Cây Nhạc Ngựa", "Cây Bàng Đài Loan", "Cây Giáng Hương", "Cây Xà Cừ"];
  const streets = ["Nguyễn Văn Linh", "Lê Duẩn", "Bạch Đằng", "Trần Phú", "Nguyễn Tri Phương", "Hùng Vương"];
  const wards = ["Phường Vĩnh Trung", "Phường Thạch Thang", "Phường Hải Châu 1", "Phường Phước Ninh"];

  return Array.from({ length: count }).map((_, i) => ({
    id: `CX-${i}`,
    name: speciesList[Math.floor(Math.random() * speciesList.length)],
    street: streets[Math.floor(Math.random() * streets.length)],
    address: wards[Math.floor(Math.random() * wards.length)],
    // Tọa độ rải đều khu vực trung tâm Hải Châu
    lng: 108.195 + Math.random() * 0.035,
    lat: 16.045 + Math.random() * 0.025,
    status: Math.random() > 0.1 ? "healthy" : "needs-care",
  }));
};

const MOCK_TREES = generateDenseTrees(1000);

export function TreeManagementMap() {
  const [selectedTree, setSelectedTree] = React.useState<typeof MOCK_TREES[0] | null>(null);

  return (
    <div className="absolute inset-0 z-10 bg-muted/10">
      <Map
        center={[108.21, 16.06]} 
        zoom={14}
        className="w-full h-full relative"
      >
        <MapControls position="top-right" showCompass showLocate showZoom />

        {/* ĐÃ FIX LỖI HIỂN THỊ MARKER */}
        {MOCK_TREES.map((tree) => (
          <MapMarker
            key={tree.id}
            longitude={tree.lng}
            latitude={tree.lat}
            onClick={(e: any) => {
              e.originalEvent?.stopPropagation();
              setSelectedTree(tree);
            }}
          >
            {/* Bắt buộc phải có <MarkerContent> bọc ngoài UI của marker */}
            <MarkerContent>
              <div
                className={`h-2.5 w-2.5 rounded-full border border-green-950 shadow-sm cursor-pointer hover:scale-[2] transition-transform ${
                  tree.status === "healthy" ? "bg-[#32CD32]" : "bg-orange-500 animate-pulse"
                }`}
              />
            </MarkerContent>
          </MapMarker>
        ))}

        {/* POPUP CHI TIẾT */}
        {selectedTree && (
          <MapPopup
            longitude={selectedTree.lng}
            latitude={selectedTree.lat}
            onClose={() => setSelectedTree(null)}
            closeButton={false}
            anchor="bottom"
            offset={15}
            className="z-50 p-0 overflow-hidden rounded-md shadow-2xl border border-border w-[380px] bg-background"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-[15px] font-bold text-[#007B22]">Thông tin cơ bản</h3>
                <div className="flex gap-2">
                  <ChevronLeft className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  <X 
                    className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" 
                    onClick={() => setSelectedTree(null)} 
                  />
                </div>
              </div>

              <div className="p-3">
                <div className="border border-[#007B22] rounded-[2px] overflow-hidden text-[13px]">
                  <div className="flex border-b border-[#007B22]">
                    <div className="w-1/3 p-2 border-r border-[#007B22] text-foreground font-medium">Tên cây</div>
                    <div className="w-2/3 p-2 text-foreground">{selectedTree.name}</div>
                  </div>
                  <div className="flex border-b border-[#007B22]">
                    <div className="w-1/3 p-2 border-r border-[#007B22] text-foreground font-medium">Địa chỉ</div>
                    <div className="w-2/3 p-2 text-foreground">{selectedTree.address}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 p-2 border-r border-[#007B22] text-foreground font-medium">Tuyến đường</div>
                    <div className="w-2/3 p-2 text-foreground">{selectedTree.street}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 pb-3">
                <Button className="bg-[#007B22] hover:bg-[#006400] text-white h-7 text-[12px] px-3 rounded-sm shadow-none">
                  Chi tiết
                </Button>
                <Button className="bg-[#007B22] hover:bg-[#006400] text-white h-7 text-[12px] px-3 rounded-sm shadow-none">
                  Chỉ đường
                </Button>
                <Button className="bg-[#007B22] hover:bg-[#006400] text-white h-7 w-8 p-0 rounded-sm shadow-none">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                <div className="flex-1" />
                <Button variant="outline" className="h-7 w-7 p-0 bg-[#007B22] text-white hover:bg-[#006400] hover:text-white border-none rounded-sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-7 w-7 p-0 bg-[#007B22] text-white hover:bg-[#006400] hover:text-white border-none rounded-sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-1">
                  <List className="h-3 w-3" /> 1 trên 1
                </span>
              </div>
            </div>
          </MapPopup>
        )}
      </Map>
    </div>
  );
}