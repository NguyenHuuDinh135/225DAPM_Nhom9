import { useState, useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"

const PlansPage = () => {
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: "Kế hoạch trồng cây xanh tại công viên A",
      description: "Trồng 50 cây xanh tại công viên A để cải thiện môi trường.",
      status: "pending",
    },
    {
      id: 2,
      name: "Kế hoạch bảo trì cây xanh đường B",
      description: "Kiểm tra và bảo trì cây xanh trên đường B.",
      status: "approved",
    },
    {
      id: 3,
      name: "Kế hoạch trồng cây xanh tại trường học C",
      description: "Trồng 30 cây xanh tại trường học C để tạo bóng mát.",
      status: "pending",
    },
  ])

  const approvePlan = (id: number) => {
    // Approve plan logic
    alert("Kế hoạch đã được duyệt.")
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, status: "approved" } : plan
      )
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Quản lý Kế hoạch</h1>
      <Separator className="mb-4" />
      <ul>
        {plans.map((plan) => (
          <li key={plan.id} className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <p>{plan.description}</p>
              </div>
              <div>
                {plan.status === "pending" && (
                  <Button onClick={() => approvePlan(plan.id)}>Duyệt</Button>
                )}
                {plan.status === "approved" && <span>Đã duyệt</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PlansPage
