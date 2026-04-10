"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import {
  forbiddenSpecies,
  getSpeciesSummaries,
  limitedSpecies,
  searchByKeyword,
} from "@/lib/trees"

type TabType = "chung-loai" | "cam-trong" | "han-che"

const speciesSummaries = getSpeciesSummaries()

export default function CategoryPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("chung-loai")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSpecies = useMemo(
    () => searchByKeyword(speciesSummaries, searchQuery),
    [searchQuery]
  )
  const filteredForbidden = useMemo(
    () => searchByKeyword(forbiddenSpecies, searchQuery),
    [searchQuery]
  )
  const filteredLimited = useMemo(
    () => searchByKeyword(limitedSpecies, searchQuery),
    [searchQuery]
  )

  const getTabTitle = () => {
    switch (activeTab) {
      case "chung-loai":
        return "Chủng loại cây xanh"
      case "cam-trong":
        return "Cây cấm trồng"
      case "han-che":
        return "Cây hạn chế trồng"
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#f8fafc] pb-10">
      <div className="w-full border-b border-border/50 bg-transparent py-4">
        <div className="container mx-auto flex justify-center gap-2 md:gap-6">
          <TabButton
            active={activeTab === "chung-loai"}
            onClick={() => setActiveTab("chung-loai")}
          >
            Chủng loại cây xanh
          </TabButton>
          <TabButton
            active={activeTab === "cam-trong"}
            onClick={() => setActiveTab("cam-trong")}
          >
            Cây cấm trồng
          </TabButton>
          <TabButton
            active={activeTab === "han-che"}
            onClick={() => setActiveTab("han-che")}
          >
            Cây hạn chế trồng
          </TabButton>
        </div>
      </div>

      <div className="container mx-auto mt-6 px-4">
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 border-b p-4 md:flex-row">
            <h2 className="text-xl font-bold text-[#007B22]">{getTabTitle()}</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nhập vào từ khóa..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 bg-muted/20 pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "chung-loai" ? (
              <Table>
                <TableHeader className="bg-[#c6f6d5] text-[#166534]">
                  <TableRow className="hover:bg-[#c6f6d5]">
                    <TableHead className="w-16 text-center">STT</TableHead>
                    <TableHead className="min-w-[150px]">Tên loại cây</TableHead>
                    <TableHead className="min-w-[220px]">Tên khoa học</TableHead>
                    <TableHead className="min-w-[260px]">Đặc tính sinh học</TableHead>
                    <TableHead className="min-w-[280px]">Mô tả</TableHead>
                    <TableHead className="min-w-[100px] text-center">Số lượng</TableHead>
                    <TableHead className="min-w-[250px]">Vùng phân bố</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSpecies.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer align-top transition-colors hover:bg-emerald-50"
                      onClick={() =>
                        router.push(`/tree-detail/${row.treeIds[0]}?from=category`)
                      }
                    >
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="space-y-1 whitespace-normal">
                        <p>{row.scientificName}</p>
                        <p className="text-muted-foreground">{row.family}</p>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          {row.biology.slice(0, 3).map((item) => (
                            <p key={item}>{item}</p>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal leading-relaxed">
                        {row.description}
                      </TableCell>
                      <TableCell className="text-center">{row.quantity}</TableCell>
                      <TableCell className="whitespace-normal leading-relaxed">
                        {row.distribution}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader className="bg-[#c6f6d5] text-[#166534]">
                  <TableRow className="hover:bg-[#c6f6d5]">
                    <TableHead className="w-16 text-center">STT</TableHead>
                    <TableHead className="min-w-[150px]">Tên loại cây</TableHead>
                    <TableHead className="min-w-[250px]">Tên khoa học</TableHead>
                    <TableHead className="min-w-[200px]">Họ thực vật</TableHead>
                    <TableHead className="min-w-[350px]">Mô tả</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(activeTab === "cam-trong" ? filteredForbidden : filteredLimited).map(
                    (row, index) => (
                      <TableRow key={row.id} className="align-top">
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="whitespace-normal italic">
                          {row.scientific}
                        </TableCell>
                        <TableCell>{row.family}</TableCell>
                        <TableCell className="whitespace-normal">{row.desc}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`rounded-md px-6 py-2 transition-all ${
        active
          ? "bg-[#007B22] text-white hover:bg-[#006400] hover:text-white"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </Button>
  )
}
