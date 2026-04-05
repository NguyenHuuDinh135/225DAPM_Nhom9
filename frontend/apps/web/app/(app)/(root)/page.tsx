import { TreeManagementMap } from "./components/home-map"
import { HomeStats } from "./components/home-stats"

export default function HomePage() {
  return (
    // Dùng flex-col và h-full để Bản đồ chiếm không gian còn lại, Thống kê nằm sát đáy
    <div className="relative flex flex-col flex-1 w-full h-full overflow-hidden">
      
      {/* Khối Bản đồ (Tự động giãn hết chiều cao) */}
      <div className="relative flex-1 w-full min-h-[400px]">
        <TreeManagementMap />
      </div>

      {/* Khối Thống kê */}
      <HomeStats />
      
    </div>
  )
}