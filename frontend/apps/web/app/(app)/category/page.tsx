"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

// --- MOCK DATA ---

const chungLoaiData = [
  {
    id: 1,
    name: "Bằng lăng",
    scientific: {
      ten: "Lagerstroemia flosreginae retz",
      ho: "Lythraceae",
    },
    biology: [
      "Hình thức tán: Rộng",
      "Dạng lá: Lá rộng",
      "Màu lá: Xanh sẫm",
      "Màu hoa: Tím hồng",
      "Thời kỳ rụng lá: Tháng 2 - 3",
      "Thời kỳ nở hoa: Tháng 5 - 7",
    ],
    description: "Loài bằng lăng cho bóng mát và cho hoa đẹp nên được trồng làm hoa cảnh. Ngoài hoa tím còn có hoa các màu đậm, lợt trắng, hồng, đỏ, tím,... và cuống thu nhiều giống cũng rụng lá vàng, lá đỏ như cây phong xứ lạnh. Vài giống lùn, lùm bụi, cũng được chọn làm cây kiểng, mùa hoa nở đầy chậu. Cây gỗ lớn cao đến 20m, phân cành cao, thẳng, tán dày...",
    quantity: 2851,
    distribution: "Lăng Dục Đức, Lăng Thiệu Trị, Phường An Cựu, phường Dương Nỗ, phường Hương An, phường Kim Long, phường Kim Trà, Phường Mỹ Thượng, phường Phú Xuân, Phường Thuận Hòa, Phường Thủy Xuân, Phường Vỹ Dạ, Thị trấn Phong Điền.",
  },
  {
    id: 2,
    name: "Lim xẹt cánh (Phượng vàng)",
    scientific: {
      ten: "Peltophorum tonkinensis a.chev",
      ho: "Fabaceae",
    },
    biology: [
      "Hình thức tán: Tròn",
      "Dạng lá: Lá kép lông chim hai lần",
      "Màu lá: Xanh",
      "Màu hoa: Vàng",
      "Thời kỳ rụng lá: Tháng 1 - 3",
      "Thời kỳ nở hoa: Tháng 5 - 7",
    ],
    description: "Trung mộc cao 20-25m, thân màu xám trắng, phân cành thấp. Hoa chùm tụ tán ở đầu cành có lông màu hoe đỏ như nhung dài 20–40 cm, hoa nhỏ 2 cm có năm cánh màu vàng, đáy có lông. Quả đậu, dẹt dài 10–12 cm.",
    quantity: 2074,
    distribution: "Lăng Thiệu Trị, Phường An Cựu, Phường Mỹ Thượng, phường Phú Xuân, Phường Thuận Hòa, Phường Thủy Xuân, Phường Vỹ Dạ.",
  },
];

const camTrongData = [
  { id: 1, name: "Cao su", scientific: "Hevea brasiliensis (A.Juss.) Muell. Arg.", family: "Euphorbiaceae", desc: "Nhánh giòn, dễ gãy, hạt có chất độc." },
  { id: 2, name: "Xiro", scientific: "Carissa carandas L.", family: "Apocynaceae", desc: "Thân và cành nhánh có rất nhiều gai." },
  { id: 3, name: "Thông thiên", scientific: "Thevetia peruviana (Pres.) Merr.", family: "Apocynaceae", desc: "Hạt, lá, vỏ cây đều có chứa chất độc." },
  { id: 4, name: "Cô ca cảnh", scientific: "Erythroxylum novagrana - tense (Morris.) Hieron", family: "Eurythroxylaceae", desc: "Lá có chất cocaine gây nghiện." },
  { id: 5, name: "Bồ kết", scientific: "Gleditschia fera (Lour.) Merr.", family: "Caesalpiniaceae", desc: "Thân có nhiều gai rất to." },
];

const hanCheData = [
  { id: 1, name: "Keo lá tràm", scientific: "Acacia auriculiformis A. Cunn. Ex. Benth.", family: "Mimosaceae", desc: "Nhánh giòn, dễ tét." },
  { id: 2, name: "Bạch đàn (các loại)", scientific: "Eucalyptus spp", family: "Myrtaceae", desc: "Cây cao, tán thưa, nhỏ... ít phát huy tác dụng tạo bóng mát." },
  { id: 3, name: "Gáo trắng", scientific: "Neolamarckia cadamba(Roxb.) Bosser.", family: "Rubiaceae", desc: "Nhánh giòn, dễ gãy, quả mọng rơi làm ảnh hưởng vệ sinh môi trường." },
  { id: 4, name: "Gáo tròn", scientific: "Haldina cordifolia (Roxb.) Ridd.", family: "Rubiaceae", desc: "Nhánh giòn, dễ gãy, quả mọng rơi ảnh hưởng đến vệ sinh môi trường." },
  { id: 5, name: "Keo tai tượng", scientific: "Acacia mangium Willd.", family: "Mimosaceae", desc: "Nhánh giòn, dễ tét." },
];


type TabType = "chung-loai" | "cam-trong" | "han-che";

export default function CategoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>("chung-loai");
  const [searchQuery, setSearchQuery] = useState("");

  // Helper để lấy tiêu đề tương ứng với tab
  const getTabTitle = () => {
    switch (activeTab) {
      case "chung-loai": return "Chủng loại cây xanh";
      case "cam-trong": return "Cây cấm trồng";
      case "han-che": return "Cây hạn chế trồng";
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-[#f8fafc] pb-10">
      
      {/* 1. KHOẢNG TRỐNG CHO TABS Ở TRÊN CÙNG */}
      <div className="w-full bg-transparent py-4 border-b border-border/50">
        <div className="container mx-auto flex justify-center gap-2 md:gap-6">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("chung-loai")}
            className={`rounded-md px-6 py-2 transition-all ${
              activeTab === "chung-loai" 
                ? "bg-[#007B22] text-white hover:bg-[#006400] hover:text-white" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Chủng loại cây xanh
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("cam-trong")}
            className={`rounded-md px-6 py-2 transition-all ${
              activeTab === "cam-trong" 
                ? "bg-[#007B22] text-white hover:bg-[#006400] hover:text-white" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Cây cấm trồng
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("han-che")}
            className={`rounded-md px-6 py-2 transition-all ${
              activeTab === "han-che" 
                ? "bg-[#007B22] text-white hover:bg-[#006400] hover:text-white" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Cây hạn chế trồng
          </Button>
        </div>
      </div>

      {/* 2. NỘI DUNG CHÍNH (BẢNG DỮ LIỆU) */}
      <div className="container mx-auto mt-6 px-4">
        <div className="bg-white border border-border shadow-sm rounded-lg overflow-hidden">
          
          {/* Header Bảng: Tiêu đề & Ô Tìm kiếm */}
          <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b">
            <h2 className="text-xl font-bold text-[#007B22]">
              {getTabTitle()}
            </h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nhập vào từ khóa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-muted/20"
              />
            </div>
          </div>

          {/* Wrapper Bảng (cho phép scroll ngang trên mobile) */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              
              {/* Table Header: Màu xanh nhạt đặc trưng */}
              <thead className="bg-[#c6f6d5] text-[#166534] font-semibold border-b">
                {activeTab === "chung-loai" ? (
                  <tr>
                    <th className="px-4 py-3 text-center w-16">STT</th>
                    <th className="px-4 py-3 min-w-[150px]">Tên loại cây</th>
                    <th className="px-4 py-3 min-w-[200px]">Tên khoa học</th>
                    <th className="px-4 py-3 min-w-[250px]">Đặc tính sinh học</th>
                    <th className="px-4 py-3 min-w-[300px]">Mô tả</th>
                    <th className="px-4 py-3 text-center min-w-[100px]">Số lượng</th>
                    <th className="px-4 py-3 min-w-[250px]">Vùng phân bố</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-3 text-center w-16">STT</th>
                    <th className="px-4 py-3 min-w-[150px]">Tên loại cây</th>
                    <th className="px-4 py-3 min-w-[250px]">Tên khoa học</th>
                    <th className="px-4 py-3 min-w-[200px]">Họ thực vật</th>
                    <th className="px-4 py-3 min-w-[350px]">Mô tả</th>
                  </tr>
                )}
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-border/50 text-foreground">
                
                {/* --- RENDER TAB: CHỦNG LOẠI CÂY XANH --- */}
                {activeTab === "chung-loai" && chungLoaiData.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors align-top">
                    <td className="px-4 py-4 text-center">{row.id}</td>
                    <td className="px-4 py-4 font-medium">{row.name}</td>
                    <td className="px-4 py-4 space-y-1">
                      <p><span className="text-muted-foreground">Tên khoa học:</span> <br/>{row.scientific.ten}</p>
                      <p><span className="text-muted-foreground">Họ thực vật:</span> <br/>{row.scientific.ho}</p>
                    </td>
                    <td className="px-4 py-4 space-y-1">
                      {row.biology.map((item, idx) => (
                        <p key={idx}>{item}</p>
                      ))}
                    </td>
                    <td className="px-4 py-4 leading-relaxed text-justify">
                      {row.description}
                    </td>
                    <td className="px-4 py-4 text-center">{row.quantity}</td>
                    <td className="px-4 py-4 leading-relaxed">
                      {row.distribution}
                    </td>
                  </tr>
                ))}

                {/* --- RENDER TAB: CÂY CẤM TRỒNG --- */}
                {activeTab === "cam-trong" && camTrongData.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors align-top">
                    <td className="px-4 py-4 text-center">{row.id}</td>
                    <td className="px-4 py-4 font-medium">{row.name}</td>
                    <td className="px-4 py-4 italic">{row.scientific}</td>
                    <td className="px-4 py-4">{row.family}</td>
                    <td className="px-4 py-4">{row.desc}</td>
                  </tr>
                ))}

                {/* --- RENDER TAB: CÂY HẠN CHẾ TRỒNG --- */}
                {activeTab === "han-che" && hanCheData.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors align-top">
                    <td className="px-4 py-4 text-center">{row.id}</td>
                    <td className="px-4 py-4 font-medium">{row.name}</td>
                    <td className="px-4 py-4 italic">{row.scientific}</td>
                    <td className="px-4 py-4">{row.family}</td>
                    <td className="px-4 py-4">{row.desc}</td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}