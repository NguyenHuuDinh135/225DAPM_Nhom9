import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"

const PlansPage = () => {
  const [plans, setPlans] = useState([
    {
      id: 1,
      code: "KH001",
      name: "Kế hoạch trồng cây xanh tại công viên A",
      description: "Trồng 50 cây xanh tại công viên A để cải thiện môi trường.",
      status: "Chờ duyệt",
      creator: "Nguyễn Văn A",
      category: "Công viên",
      startDate: "2026-04-10",
    },
    {
      id: 2,
      code: "KH002",
      name: "Kế hoạch bảo trì cây xanh đường B",
      description: "Kiểm tra và bảo trì cây xanh trên đường B.",
      status: "Đã duyệt",
      creator: "Trần Thị B",
      category: "Đường phố",
      startDate: "2026-04-12",
    },
    {
      id: 3,
      code: "KH003",
      name: "Kế hoạch trồng cây xanh tại trường học C",
      description: "Trồng 30 cây xanh tại trường học C để tạo bóng mát.",
      status: "Chờ duyệt",
      creator: "Lê Văn C",
      category: "Trường học",
      startDate: "2026-04-15",
    },
  ])

  const approvePlan = (id) => {
    alert("Kế hoạch đã được duyệt.")
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, status: "Đã duyệt" } : plan
      )
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Quản lý Kế hoạch</h1>
      <Separator className="mb-6" />
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Mã</th>
            <th className="border border-gray-300 px-4 py-2">Tên kế hoạch</th>
            <th className="border border-gray-300 px-4 py-2">Trạng thái</th>
            <th className="border border-gray-300 px-4 py-2">Người tạo</th>
            <th className="border border-gray-300 px-4 py-2">Lớp kế hoạch</th>
            <th className="border border-gray-300 px-4 py-2">
              Thời gian bắt đầu
            </th>
            <th className="border border-gray-300 px-4 py-2">Tác vụ</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-center">
                {plan.code}
              </td>
              <td className="border border-gray-300 px-4 py-2">{plan.name}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <span
                  className={`rounded px-2 py-1 text-white ${
                    plan.status === "Chờ duyệt"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {plan.status}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {plan.creator}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {plan.category}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {plan.startDate}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {plan.status === "Chờ duyệt" && (
                  <Button onClick={() => approvePlan(plan.id)} size="sm">
                    Duyệt
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PlansPage
