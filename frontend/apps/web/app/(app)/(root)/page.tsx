import { TreeManagementMap } from "./components/home-map"
import { HomeStats } from "./components/home-stats"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { AlertCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="relative flex flex-col flex-1 w-full h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Khối Bản đồ (Full screen) */}
      <div className="absolute inset-0 z-0">
        <TreeManagementMap />
      </div>

      {/* Lớp phủ tiêu đề và CTA */}
      <div className="absolute top-8 left-8 z-10 max-w-md pointer-events-none">
        <div className="bg-background/80 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl shadow-green-900/10 pointer-events-auto">
          <h1 className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">Đà Nẵng Xanh</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
            Hệ thống giám sát và quản lý cây xanh đô thị thông minh. Cùng chung tay bảo vệ lá phổi xanh của thành phố.
          </p>
          <Button asChild className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 w-full justify-start h-12 px-6">
            <Link href="/report-incident">
              <AlertCircle className="mr-2 size-5" />
              Báo cáo sự cố cây xanh ngay
            </Link>
          </Button>
        </div>
      </div>

      {/* Khối Thống kê (Floating Glassmorphism) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-5xl px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <HomeStats />
        </div>
      </div>
      
    </div>
  )
}
