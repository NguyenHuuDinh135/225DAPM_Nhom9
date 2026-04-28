import { type Metadata } from "next"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Users, ShieldCheck, Wrench, MapPin } from "lucide-react"
import { MaintenanceTriggerButton } from "./maintenance-trigger-button"

export const metadata: Metadata = { title: "Quản trị hệ thống" }

export default function AdminPage() {
  return (
    <div className="flex h-full flex-1 flex-col gap-8 p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Quản trị hệ thống</h2>
        <p className="text-muted-foreground">Quản lý tài khoản, phân quyền và vận hành hệ thống.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        <div className="flex flex-col gap-3 rounded-lg border p-5">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-muted-foreground" />
            <span className="font-medium">Quản lý nhân viên</span>
          </div>
          <p className="text-sm text-muted-foreground">Thêm, sửa, xóa tài khoản nhân viên trong hệ thống.</p>
          <Button asChild size="sm" className="w-fit">
            <Link href="/staff">Đến trang nhân viên</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-muted-foreground" />
            <span className="font-medium">Phân quyền</span>
          </div>
          <p className="text-sm text-muted-foreground">Gán vai trò Administrator, Manager hoặc Employee cho từng tài khoản.</p>
          <Button asChild size="sm" variant="outline" className="w-fit">
            <Link href="/staff">Phân quyền nhân viên</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border p-5">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-muted-foreground" />
            <span className="font-medium">Quản lý vị trí</span>
          </div>
          <p className="text-sm text-muted-foreground">Thêm và quản lý vị trí cây xanh theo tuyến đường, phường.</p>
          <Button asChild size="sm" variant="outline" className="w-fit">
            <Link href="/settings/locations">Đến trang vị trí</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border p-5">
          <div className="flex items-center gap-2">
            <Wrench className="size-5 text-muted-foreground" />
            <span className="font-medium">Bảo dưỡng tự động</span>
          </div>
          <p className="text-sm text-muted-foreground">Kích hoạt kiểm tra và tạo công việc bảo dưỡng cho các cây đến hạn.</p>
          <MaintenanceTriggerButton />
        </div>
      </div>
    </div>
  )
}
