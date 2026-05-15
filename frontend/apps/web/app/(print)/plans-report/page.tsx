"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { apiClient } from "@/lib/api-client"
import { ArrowLeft, Loader2, Printer } from "lucide-react"

interface PlanReportRow {
  id: number
  name: string
  creatorName: string
  startDate: string
  endDate: string
  status: string
  statusName?: string
}

export default function PlansReportPage() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState<PlanReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const search = searchParams.get("search") ?? ""
  const autoPrint = searchParams.get("autoPrint") === "1"
  const reportDate = useMemo(() => new Date(), [])

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await apiClient.get<PlanReportRow[]>("/api/Planning")
        const list = Array.isArray(data) ? data : []
        const filtered = search
          ? list.filter((plan) =>
              plan.name?.toLowerCase().includes(search.toLowerCase())
            )
          : list

        if (isMounted) {
          setItems(filtered)
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu báo cáo."
          setError(message)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [search])

  useEffect(() => {
    if (!autoPrint || loading || error) return
    const timer = setTimeout(() => window.print(), 300)
    return () => clearTimeout(timer)
  }, [autoPrint, loading, error])

  const reportDateText = reportDate.toLocaleDateString("vi-VN")

  const statusCounts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.total += 1
        if (item.status === "PendingApproval") acc.pending += 1
        if (item.status === "Approved" || item.status === "InProgress")
          acc.running += 1
        if (item.status === "Completed") acc.completed += 1
        if (item.status === "Rejected") acc.rejected += 1
        return acc
      },
      { total: 0, pending: 0, running: 0, completed: 0, rejected: 0 }
    )
  }, [items])

  const formatDate = (value: string | null | undefined) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleDateString("vi-VN")
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .print-shadow {
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="no-print mx-auto mb-6 flex max-w-[210mm] items-center justify-between px-4">
        <Link
          href="/plans"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft className="size-4" /> Quay lại kế hoạch
        </Link>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="size-4" /> In ra PDF
        </Button>
      </div>

      <div className="print-shadow mx-auto max-w-[210mm] bg-white px-10 py-10 shadow-xl">
        <div className="flex items-start justify-between text-[11px] text-slate-900">
          <div>
            <div className="font-bold uppercase">ĐOÀN CÔNG TÁC</div>
            <div className="mt-1 w-36 border-b border-slate-900" />
            <div className="mt-1">Số: ....../BC-KH</div>
          </div>
          <div className="text-center">
            <div className="font-bold uppercase">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-[10px] italic">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div className="mx-auto mt-1 w-52 border-b border-slate-900" />
            <div className="mt-1">
              Đà Nẵng, ngày {reportDate.getDate()} tháng{" "}
              {reportDate.getMonth() + 1} năm {reportDate.getFullYear()}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h1 className="text-lg font-bold tracking-wide uppercase">BÁO CÁO</h1>
          <p className="text-sm font-medium">
            Tổng hợp danh mục kế hoạch chăm sóc cây xanh
          </p>
        </div>

        <div className="mt-6 text-sm">
          <div className="font-medium">
            Kính gửi: Tổng Giám đốc Tổng công ty.
          </div>
          <p className="mt-3 leading-6">
            Báo cáo tổng hợp danh sách kế hoạch và tiến độ xử lý theo dữ liệu
            hiện hành của hệ thống. Dữ liệu được tổng hợp tại thời điểm{" "}
            {reportDateText}.
          </p>
        </div>

        <div className="mt-6 text-sm">
          <div className="font-semibold">I. Khái quát chung</div>
          <div className="mt-3 space-y-1">
            <p>
              - Tổng số kế hoạch:{" "}
              <span className="font-semibold">{statusCounts.total}</span>
            </p>
            <p>
              - Đang chờ duyệt:{" "}
              <span className="font-semibold">{statusCounts.pending}</span>
            </p>
            <p>
              - Đang triển khai:{" "}
              <span className="font-semibold">{statusCounts.running}</span>
            </p>
            <p>
              - Đã hoàn thành:{" "}
              <span className="font-semibold">{statusCounts.completed}</span>
            </p>
            <p>
              - Bị từ chối:{" "}
              <span className="font-semibold">{statusCounts.rejected}</span>
            </p>
            <p>
              - Từ khóa lọc:{" "}
              <span className="font-semibold">{search || "Không"}</span>
            </p>
          </div>
        </div>

        <div className="mt-6 text-sm">
          <div className="font-semibold">II. Danh sách kế hoạch</div>
          <div className="mt-3">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="size-4 animate-spin" /> Đang tải dữ liệu...
              </div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      STT
                    </th>
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      Mã kế hoạch
                    </th>
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      Tên kế hoạch
                    </th>
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      Người lập
                    </th>
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      Bắt đầu
                    </th>
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      Kết thúc
                    </th>
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="border border-slate-300 px-2 py-6 text-center text-slate-500"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="border border-slate-300 px-2 py-1">
                          {index + 1}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {item.id}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {item.name}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {item.creatorName || ""}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {formatDate(item.startDate)}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {formatDate(item.endDate)}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {item.statusName || item.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-10 text-sm">
          <div className="text-center">
            <p className="font-semibold">Người lập báo cáo</p>
            <p className="mt-16 text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">Giám đốc</p>
            <p className="mt-16 text-slate-500 italic">(Ký, đóng dấu)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
