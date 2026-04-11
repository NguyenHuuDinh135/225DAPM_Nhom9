import { useState, ChangeEvent } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Card } from "@workspace/ui/components/card"
import DatePicker from "react-datepicker"

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
      startDate: new Date("2026-04-10"),
    },
    {
      id: 2,
      code: "KH002",
      name: "Kế hoạch bảo trì cây xanh đường B",
      description: "Kiểm tra và bảo trì cây xanh trên đường B.",
      status: "Đã duyệt",
      creator: "Trần Thị B",
      category: "Đường phố",
      startDate: new Date("2026-04-12"),
    },
    {
      id: 3,
      code: "KH003",
      name: "Kế hoạch trồng cây xanh tại trường học C",
      description: "Trồng 30 cây xanh tại trường học C để tạo bóng mát.",
      status: "Chờ duyệt",
      creator: "Lê Văn C",
      category: "Trường học",
      startDate: new Date("2026-04-15"),
    },
  ])

  const [isCreating, setIsCreating] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commandInput, setCommandInput] = useState("")

  const [newPlan, setNewPlan] = useState({
    code: "",
    name: "",
    description: "",
    creator: "",
    category: "",
    startDate: new Date(),
  })

  // Simulate sending prompt to AI workflow
  const sendCommandToAI = (command: string) => {
    alert(`\n"${command}"`)
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setNewPlan((prev) => ({ ...prev, [name]: value }))
  }

  const createPlanAndSendCommand = () => {
    if (!newPlan.name || !newPlan.code) {
      alert("Vui lòng điền đủ mã và tên kế hoạch.")
      return
    }
    const prompt = `Tạo kế hoạch mới: Mã ${newPlan.code}, Tên "${newPlan.name}", Lớp ${newPlan.category}, Bắt đầu ${newPlan.startDate.toLocaleDateString('vi-VN')}, Người tạo: ${newPlan.creator}. Mô tả: ${newPlan.description}`
    sendCommandToAI(prompt)

    setIsSubmitting(true)
    setTimeout(() => {
      setPlans((prev) => [
        ...prev,
        { ...newPlan, id: Date.now(), status: "Chờ duyệt" },
      ])
      setNewPlan({
        code: "",
        name: "",
        description: "",
        creator: "",
        category: "",
        startDate: new Date(),
      })
      setIsSubmitting(false)
      setIsCreating(false)
    }, 500)
  }

  const handleApprovePlan = (plan: any) => {
    const prompt = `Duyệt kế hoạch ${plan.code} - ${plan.name}`
    sendCommandToAI(prompt)
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: "Đã duyệt" } : p))
  }

  const handleManualCommandSubmit = () => {
    if (!commandInput.trim()) return
    sendCommandToAI(commandInput.trim())
    setCommandInput("")
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quản lý Kế hoạch
          </h1>
          <p className="text-sm text-slate-500">
            Tạo và quản lý kế hoạch trồng cây xanh
          </p>
        </div>

        <div>
          <Button
            variant="outline"
            onClick={() => setIsCreating(!isCreating)}
            className="bg-white text-slate-700 h-9 px-4 rounded-md shadow-sm border-slate-300 font-medium"
          >
            + Lên kế hoạch mới
          </Button>
        </div>

        {/* Table Section */}
        <Card className="rounded-md border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50/50 border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-medium text-slate-700">Danh sách kế hoạch</h3>
          </div>
          <div className="overflow-x-auto bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-4 align-middle">Mã</th>
                  <th className="px-4 py-4 align-middle w-1/3">Tên kế hoạch</th>
                  <th className="px-4 py-4 align-middle whitespace-nowrap">Trạng thái</th>
                  <th className="px-4 py-4 align-middle whitespace-nowrap">Người tạo</th>
                  <th className="px-4 py-4 align-middle whitespace-nowrap">Lớp</th>
                  <th className="px-4 py-4 align-middle whitespace-nowrap">Bắt đầu</th>
                  <th className="px-4 py-4 align-middle text-center whitespace-nowrap">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 align-top text-slate-700 font-medium">{plan.code}</td>
                    <td className="px-4 py-4 align-top text-slate-900 max-w-xs">{plan.name}</td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${plan.status === "Chờ duyệt"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                      >
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">{plan.creator}</td>
                    <td className="px-4 py-4 align-top text-slate-700">{plan.category}</td>
                    <td className="px-4 py-4 align-top text-slate-700 whitespace-nowrap">
                      {plan.startDate.toLocaleDateString("vi-VN", {
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4 align-top text-center w-24">
                      {plan.status === "Chờ duyệt" ? (
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprovePlan(plan)}
                            className="flex flex-col h-auto py-1.5 px-3 items-center justify-center gap-0 bg-white border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm rounded-md"
                          >
                            <span className="text-[14px] leading-tight">✓</span>
                            <span className="text-[11px] leading-tight font-medium">Duyệt</span>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Inline Create Form Section */}
        {isCreating && (
          <Card className="rounded-md border border-slate-200 shadow-sm overflow-hidden bg-white mt-6">
            <div className="p-6 md:p-8">
              <div className="space-y-1 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Tạo Kế hoạch Mới</h2>
                <p className="text-sm text-slate-500">Điền đầy đủ thông tin để tạo kế hoạch trồng cây xanh</p>
              </div>

              <div className="grid gap-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-semibold text-slate-700">
                      Mã kế hoạch <span className="text-slate-900">*</span>
                    </Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="VD: KH001"
                      value={newPlan.code}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="bg-white border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creator" className="text-sm font-semibold text-slate-700">Người tạo</Label>
                    <Input
                      id="creator"
                      name="creator"
                      placeholder="VD: Nguyễn Văn A"
                      value={newPlan.creator}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="bg-white border-slate-300"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                    Tên kế hoạch <span className="text-slate-900">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="VD: Trồng cây xanh tại công viên"
                    value={newPlan.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="bg-white border-slate-300 w-full"
                  />
                </div>

                {/* Row 3 - Textarea */}
                <div className="space-y-2 relative">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                    Mô tả kế hoạch
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Nhập mô tả chi tiết về kế hoạch..."
                    value={newPlan.description}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="min-h-[100px] border-slate-300 bg-white resize-none"
                  />
                  {/* Mock pen icon like in user's design */}
                  <div className="absolute bottom-3 right-3 pointer-events-none text-slate-400">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-slate-700">Lớp kế hoạch</Label>
                    <Input
                      id="category"
                      name="category"
                      placeholder="VD: Công viên"
                      value={newPlan.category}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="bg-white border-slate-300"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="startDate" className="text-sm font-semibold text-slate-700">Thời gian bắt đầu</Label>
                    <div className="relative">
                      <DatePicker
                        id="startDate"
                        selected={newPlan.startDate}
                        onChange={(date: Date) =>
                          setNewPlan((prev) => ({ ...prev, startDate: date }))
                        }
                        disabled={isSubmitting}
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                        dateFormat="dd/MM/yyyy"
                      />
                      <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={createPlanAndSendCommand}
                    disabled={isSubmitting}
                    variant="outline"
                    className="h-9 px-4 gap-1.5 rounded-md font-medium border-slate-300 text-slate-800 bg-white shadow-sm"
                  >
                    <span>✓</span>
                    <span>Lưu kế hoạch ↗</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    disabled={isSubmitting}
                    className="h-9 px-4 gap-1.5 rounded-md font-medium border-slate-300 text-slate-800 bg-white shadow-sm"
                  >
                    <span className="text-[10px]">✕</span>
                    <span>Hủy</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* AI Command Center Section */}
        <Card className="rounded-md border border-[#e4dfc0] bg-[#f8f6f0] shadow-sm mt-8">
          <div className="p-6 space-y-3">
            <Label className="text-sm font-semibold text-slate-800 block">
              Gửi lệnh cho AI
            </Label>

            <div className="flex sm:flex-row flex-col gap-2">
              <Input
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualCommandSubmit()}
                className="flex-1 bg-white border-slate-300 shadow-sm"
                placeholder="VD: Tạo kế hoạch trồng 50 cây xanh tại công viên Bắc..."
              />
              <Button
                variant="outline"
                onClick={handleManualCommandSubmit}
                className="h-10 px-6 rounded-md bg-[#eeebdf] hover:bg-[#e4dfd0] text-slate-800 font-medium border-[#dcd7c9] shadow-sm"
              >
                Gửi ↗
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCommandToAI("Tạo kế hoạch tháng 5")}
                className="rounded-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium h-8"
              >
                + Tạo kế hoạch tháng 5
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCommandToAI("Ưu tiên duyệt kế hoạch gấp")}
                className="rounded-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium h-8"
              >
                📋 Ưu tiên duyệt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCommandToAI("Lập báo cáo tổng hợp kế hoạch")}
                className="rounded-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium h-8"
              >
                📊 Báo cáo tổng hợp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendCommandToAI("Gợi ý lớp kế hoạch phù hợp")}
                className="rounded-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium h-8"
              >
                💡 Gợi ý lớp KH
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}

export default PlansPage
