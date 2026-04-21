import Link from "next/link"
import { Button } from "@workspace/ui/components/button"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h2 className="text-xl font-semibold">Không tìm thấy trang</h2>
      <p className="text-sm text-muted-foreground">Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <Button asChild><Link href="/dashboard">Về trang chủ</Link></Button>
    </div>
  )
}
