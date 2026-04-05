import { ChartAreaInteractive } from "@/app/(dashboard)/components/chart-area-interactive"
import { DataTable } from "@/app/(dashboard)/components/data-table"
import { TaskMap } from "@/app/(dashboard)/components/task-map" // <--- Import map mới
import data from "./data.json"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          
          {/* KHU VỰC BẢN ĐỒ CÔNG VIỆC */}
          <div className="px-4 lg:px-6">
            <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-border shadow-sm">
              {/* Sử dụng TaskMap chuyên dụng cho Dashboard */}
              <TaskMap />
            </div>
          </div>

          {/* KHU VỰC BIỂU ĐỒ THỐNG KÊ */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          
          {/* KHU VỰC BẢNG DỮ LIỆU */}
          <DataTable data={data} />
          
        </div>
      </div>
    </div>
  )
}