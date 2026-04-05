import { Trees, Leaf, Droplets, Layers, MapPin, Route } from "lucide-react"

// Mock data lấy từ hình ảnh
const treeDetails = [
  { label: "Cây di sản:", value: "160" },
  { label: "Chủng loại cây:", value: "256" },
  { label: "Cây đã trồng thêm trong năm:", value: "11" },
  { label: "Cây loại 1 (Đường kính thân ≤ 20 cm):", value: "4542" },
  { label: "Cây loại 2 (Đường kính thân 20 - 50 cm):", value: "8743" },
  { label: "Cây loại 3 (Đường kính thân > 50 cm):", value: "1089" },
]

const summaryStats = [
  { icon: Leaf, value: "2", label: "Thảm xanh" },
  { icon: Droplets, value: "1", label: "Mặt nước" },
  { icon: Layers, value: "337", label: "Ô trống" },
  { icon: MapPin, value: "44", label: "Khu vực" },
  { icon: Trees, value: "224", label: "Tuyến" },
]

export function HomeStats() {
  return (
    <div className="bg-background border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-border">
          
          {/* Cột 1: Tổng số cây & Chi tiết (Chiếm không gian lớn hơn) */}
          <div className="flex items-center gap-8 pr-8 pb-4 xl:pb-0">
            {/* Tổng số */}
            <div className="flex flex-col items-center justify-center min-w-[120px] text-green-700">
              <Trees className="h-14 w-14 mb-2" strokeWidth={1.5} />
              <span className="text-3xl font-bold text-foreground">14374</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Cây xanh</span>
            </div>
            
            {/* Danh sách chi tiết */}
            <div className="flex flex-col gap-1.5 border-l pl-6 border-border/50">
              {treeDetails.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between min-w-[280px] text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold text-foreground ml-4">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Các cột còn lại: Thống kê thành phần */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 xl:pt-0 pl-0 xl:pl-8 divide-x divide-border/50">
            {summaryStats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="flex flex-col items-center justify-center gap-2 pl-4 first:pl-0 xl:first:pl-4">
                  <div className="text-green-700">
                    <Icon className="h-10 w-10" strokeWidth={1.5} />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</span>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}