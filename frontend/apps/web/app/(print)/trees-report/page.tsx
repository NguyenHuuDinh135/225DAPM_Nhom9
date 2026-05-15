"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { apiClient } from "@/lib/api-client"
import { ArrowLeft, Loader2, Printer } from "lucide-react"

interface TreeReportRow {
  id: number
  name: string | null
  treeTypeName: string | null
  condition: string | null
  lastMaintenanceDate: string | null
  latitude: number | null
  longitude: number | null
}

export default function TreesReportPage() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState<TreeReportRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const condition = searchParams.get("condition") ?? ""
  const searchTerm = searchParams.get("searchTerm") ?? ""
  const autoPrint = searchParams.get("autoPrint") === "1"
  const treeIds = useMemo(() => {
    return searchParams
      .getAll("treeIds")
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
  }, [searchParams])

  const reportDate = useMemo(() => new Date(), [])

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          pageNumber: "1",
          pageSize: "10000",
        })
        if (condition) params.append("condition", condition)
        if (searchTerm) params.append("searchTerm", searchTerm)
        if (treeIds.length > 0) {
          treeIds.forEach((id) => params.append("treeIds", id.toString()))
        }

        const data = await apiClient.get<any>(`/api/trees?${params.toString()}`)
        const list = (data?.items as TreeReportRow[]) ?? []
        const filtered =
          treeIds.length > 0
            ? list.filter((item) => treeIds.includes(item.id))
            : list

        if (isMounted) {
          setItems(filtered)
          setTotalCount(
            treeIds.length > 0
              ? treeIds.length
              : ((data?.totalCount as number) ?? filtered.length)
          )
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
  }, [condition, searchTerm, treeIds])

  useEffect(() => {
    if (!autoPrint || loading || error) return
    const timer = setTimeout(() => window.print(), 300)
    return () => clearTimeout(timer)
  }, [autoPrint, loading, error])

  const formatDate = (value: string | null) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleDateString("vi-VN")
  }

  const reportDateText = reportDate.toLocaleDateString("vi-VN")

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
          href="/trees"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft className="size-4" /> Quay lại danh mục cây
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
            <div className="mt-1">Số: ....../BC-QLCX</div>
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
            Kết quả thống kê danh mục cây xanh đô thị
          </p>
        </div>

        <div className="mt-6 text-sm">
          <div className="font-medium">
            Kính gửi: Tổng Giám đốc Tổng công ty.
          </div>
          <p className="mt-3 leading-6">
            Căn cứ số liệu quản lý cây xanh hiện hành, đoàn công tác xin báo cáo
            tổng hợp tình hình danh mục cây xanh theo phạm vi bộ lọc và dữ liệu
            tại thời điểm {reportDateText}.
          </p>
        </div>

        <div className="mt-6 text-sm">
          <div className="font-semibold">I. Khái quát chung</div>
          <div className="mt-3 space-y-1">
            <p>
              - Tổng số cây (theo bộ lọc):{" "}
              <span className="font-semibold">{totalCount}</span>
            </p>
            <p>
              - Bộ lọc tình trạng:{" "}
              <span className="font-semibold">{condition || "Không"}</span>
            </p>
            <p>
              - Từ khóa tìm kiếm:{" "}
              <span className="font-semibold">{searchTerm || "Không"}</span>
            </p>
            <p>
              - Thời điểm lập báo cáo:{" "}
              <span className="font-semibold">{reportDateText}</span>
            </p>
          </div>
        </div>

        <div className="mt-6 text-sm">
          <div className="font-semibold">II. Danh sách cây xanh</div>
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
                      Mã cây
                    </th>
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      Tên cây
                    </th>
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      Loại cây
                    </th>
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      Tình trạng
                    </th>
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      Vĩ độ
                    </th>
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      Kinh độ
                    </th>
                    <th className="border border-slate-300 px-2 py-2 text-left">
                      Bảo trì gần nhất
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
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
                          {item.name ?? ""}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {item.treeTypeName ?? ""}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {item.condition ?? ""}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {item.latitude ?? ""}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {item.longitude ?? ""}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {formatDate(item.lastMaintenanceDate)}
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
