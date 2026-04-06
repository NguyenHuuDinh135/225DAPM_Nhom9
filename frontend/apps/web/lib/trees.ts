export type TreeStatus = "healthy" | "needs-care" | "monitoring"

export type TreeSpecies = {
  id: string
  name: string
  scientificName: string
  family: string
  biology: string[]
  description: string
  distribution: string
}

export type TreeRecord = {
  id: string
  code: string
  speciesId: string
  plantedYear: number
  heightMeters: number
  trunkDiameterCm: number
  canopyDiameterM: number
  status: TreeStatus
  healthNote: string
  street: string
  ward: string
  district: string
  addressLine: string
  lat: number
  lng: number
}

export type RestrictedSpecies = {
  id: string
  name: string
  scientific: string
  family: string
  desc: string
}

export const treeSpeciesCatalog: TreeSpecies[] = [
  {
    id: "bang-lang",
    name: "Bằng lăng",
    scientificName: "Lagerstroemia flos-reginae Retz.",
    family: "Lythraceae",
    biology: [
      "Hình thức tán: rộng, cân đối",
      "Dạng lá: lá rộng",
      "Màu lá: xanh sẫm",
      "Màu hoa: tím hồng",
      "Thời kỳ rụng lá: tháng 2 - 3",
      "Thời kỳ nở hoa: tháng 5 - 7",
    ],
    description:
      "Loài cây bóng mát phổ biến trong đô thị, cho hoa đẹp và phù hợp với các tuyến đường cảnh quan.",
    distribution:
      "An Cựu, Dương Nỗ, Kim Long, Phú Xuân, Thuận Hòa, Thủy Xuân, Vỹ Dạ.",
  },
  {
    id: "lim-xet-canh",
    name: "Lim xẹt cánh (Phượng vàng)",
    scientificName: "Peltophorum tonkinense A.Chev.",
    family: "Fabaceae",
    biology: [
      "Hình thức tán: tròn",
      "Dạng lá: lá kép lông chim hai lần",
      "Màu lá: xanh",
      "Màu hoa: vàng",
      "Thời kỳ rụng lá: tháng 1 - 3",
      "Thời kỳ nở hoa: tháng 5 - 7",
    ],
    description:
      "Cây gỗ trung bình đến lớn, tán rộng, thích hợp trồng dọc các trục đường và khu công cộng.",
    distribution:
      "An Cựu, Mỹ Thượng, Phú Xuân, Thuận Hòa, Thủy Xuân, Vỹ Dạ.",
  },
  {
    id: "giang-huong",
    name: "Giáng hương",
    scientificName: "Pterocarpus macrocarpus Kurz",
    family: "Fabaceae",
    biology: [
      "Hình thức tán: ô rộng",
      "Dạng lá: lá kép lông chim",
      "Màu lá: xanh đậm",
      "Màu hoa: vàng nhạt",
      "Sinh trưởng: chậm, bền vững",
      "Khả năng chịu gió tốt",
    ],
    description:
      "Loài cây có giá trị cảnh quan cao, thân đẹp và phù hợp các khu vực trung tâm cần cây lâu năm.",
    distribution:
      "Hải Châu, Thanh Khê, Sơn Trà và các khuôn viên công cộng ven sông.",
  },
  {
    id: "xa-cu",
    name: "Xà cừ",
    scientificName: "Khaya senegalensis",
    family: "Meliaceae",
    biology: [
      "Hình thức tán: lớn",
      "Dạng lá: lá kép",
      "Màu lá: xanh thẫm",
      "Màu hoa: trắng ngà",
      "Sinh trưởng: nhanh",
      "Khả năng che bóng tốt",
    ],
    description:
      "Loài cây tạo bóng mát mạnh, thường xuất hiện trên các tuyến đường lớn và khu hành chính.",
    distribution:
      "Lê Duẩn, Điện Biên Phủ, Nguyễn Tất Thành và các trục đường chính.",
  },
]

export const treeRecords: TreeRecord[] = [
  {
    id: "tree-001",
    code: "CX-001",
    speciesId: "bang-lang",
    plantedYear: 2016,
    heightMeters: 8.2,
    trunkDiameterCm: 24,
    canopyDiameterM: 5.1,
    status: "healthy",
    healthNote: "Sinh trưởng tốt, tán cân đối, chưa ghi nhận sâu bệnh.",
    street: "Bạch Đằng",
    ward: "Hải Châu 1",
    district: "Hải Châu",
    addressLine: "Đối diện công viên APEC",
    lat: 16.0672,
    lng: 108.2248,
  },
  {
    id: "tree-002",
    code: "CX-002",
    speciesId: "bang-lang",
    plantedYear: 2018,
    heightMeters: 6.9,
    trunkDiameterCm: 19,
    canopyDiameterM: 4.4,
    status: "monitoring",
    healthNote: "Cần theo dõi rễ nổi sát bó vỉa và tỉa cành định kỳ.",
    street: "Trần Phú",
    ward: "Hải Châu 1",
    district: "Hải Châu",
    addressLine: "Gần thư viện khoa học tổng hợp",
    lat: 16.0711,
    lng: 108.2206,
  },
  {
    id: "tree-003",
    code: "CX-003",
    speciesId: "lim-xet-canh",
    plantedYear: 2014,
    heightMeters: 11.4,
    trunkDiameterCm: 33,
    canopyDiameterM: 6.2,
    status: "healthy",
    healthNote: "Hoa nở theo mùa, tán phủ tốt, thân ổn định.",
    street: "Nguyễn Văn Linh",
    ward: "Nam Dương",
    district: "Hải Châu",
    addressLine: "Trước số 124 Nguyễn Văn Linh",
    lat: 16.0608,
    lng: 108.2157,
  },
  {
    id: "tree-004",
    code: "CX-004",
    speciesId: "lim-xet-canh",
    plantedYear: 2012,
    heightMeters: 12.1,
    trunkDiameterCm: 36,
    canopyDiameterM: 6.8,
    status: "needs-care",
    healthNote: "Có dấu hiệu sâu lá cục bộ, cần chăm sóc và xử lý sớm.",
    street: "Lê Duẩn",
    ward: "Thạch Thang",
    district: "Hải Châu",
    addressLine: "Gần bảo tàng Đà Nẵng",
    lat: 16.0752,
    lng: 108.2149,
  },
  {
    id: "tree-005",
    code: "CX-005",
    speciesId: "giang-huong",
    plantedYear: 2010,
    heightMeters: 13.5,
    trunkDiameterCm: 42,
    canopyDiameterM: 7.4,
    status: "healthy",
    healthNote: "Thân thẳng, tán đẹp, phù hợp làm cây điểm nhấn tuyến phố.",
    street: "2 Tháng 9",
    ward: "Bình Hiên",
    district: "Hải Châu",
    addressLine: "Khu vực quảng trường 29/3",
    lat: 16.0498,
    lng: 108.2241,
  },
  {
    id: "tree-006",
    code: "CX-006",
    speciesId: "giang-huong",
    plantedYear: 2011,
    heightMeters: 12.7,
    trunkDiameterCm: 38,
    canopyDiameterM: 6.9,
    status: "monitoring",
    healthNote: "Cần tiếp tục theo dõi độ nghiêng thân sau mùa mưa bão.",
    street: "Phan Châu Trinh",
    ward: "Phước Ninh",
    district: "Hải Châu",
    addressLine: "Trước cổng trường THPT Phan Châu Trinh",
    lat: 16.0644,
    lng: 108.2191,
  },
  {
    id: "tree-007",
    code: "CX-007",
    speciesId: "xa-cu",
    plantedYear: 2008,
    heightMeters: 16.4,
    trunkDiameterCm: 51,
    canopyDiameterM: 8.6,
    status: "healthy",
    healthNote: "Cây trưởng thành, tán lớn, độ che phủ tốt.",
    street: "Điện Biên Phủ",
    ward: "Chính Gián",
    district: "Thanh Khê",
    addressLine: "Dải phân cách gần công viên 29/3",
    lat: 16.0601,
    lng: 108.1979,
  },
  {
    id: "tree-008",
    code: "CX-008",
    speciesId: "xa-cu",
    plantedYear: 2006,
    heightMeters: 17.1,
    trunkDiameterCm: 54,
    canopyDiameterM: 8.9,
    status: "needs-care",
    healthNote: "Cần kiểm tra bộ rễ và tỉa cành lớn trước mùa mưa.",
    street: "Nguyễn Tất Thành",
    ward: "Xuân Hà",
    district: "Thanh Khê",
    addressLine: "Ven biển đối diện bãi tắm Xuân Hà",
    lat: 16.0825,
    lng: 108.1992,
  },
]

export const forbiddenSpecies: RestrictedSpecies[] = [
  {
    id: "cam-001",
    name: "Cao su",
    scientific: "Hevea brasiliensis",
    family: "Euphorbiaceae",
    desc: "Nhánh giòn, dễ gãy, hạt có độc tính.",
  },
  {
    id: "cam-002",
    name: "Thông thiên",
    scientific: "Thevetia peruviana",
    family: "Apocynaceae",
    desc: "Hạt, lá và vỏ cây có độc, không phù hợp trồng nơi công cộng.",
  },
  {
    id: "cam-003",
    name: "Bồ kết",
    scientific: "Gleditschia fera",
    family: "Caesalpiniaceae",
    desc: "Thân có nhiều gai lớn, tiềm ẩn nguy hiểm cho người đi bộ.",
  },
]

export const limitedSpecies: RestrictedSpecies[] = [
  {
    id: "han-che-001",
    name: "Keo lá tràm",
    scientific: "Acacia auriculiformis",
    family: "Mimosaceae",
    desc: "Nhánh giòn, dễ tét khi có gió lớn.",
  },
  {
    id: "han-che-002",
    name: "Bạch đàn",
    scientific: "Eucalyptus spp.",
    family: "Myrtaceae",
    desc: "Tán thưa, ít phát huy hiệu quả bóng mát trong đô thị.",
  },
  {
    id: "han-che-003",
    name: "Gáo trắng",
    scientific: "Neolamarckia cadamba",
    family: "Rubiaceae",
    desc: "Quả rụng và cành giòn có thể ảnh hưởng vệ sinh môi trường.",
  },
]

export function getSpeciesById(speciesId: string) {
  return treeSpeciesCatalog.find((species) => species.id === speciesId) ?? null
}

export function getTreeById(treeId: string) {
  const tree = treeRecords.find((item) => item.id === treeId)

  if (!tree) {
    return null
  }

  const species = getSpeciesById(tree.speciesId)

  if (!species) {
    return null
  }

  return {
    ...tree,
    species,
  }
}

export function getTreesBySpeciesId(speciesId: string) {
  return treeRecords
    .filter((tree) => tree.speciesId === speciesId)
    .map((tree) => ({
      ...tree,
      species: getSpeciesById(tree.speciesId)!,
    }))
}

export function getSpeciesSummaries() {
  return treeSpeciesCatalog.map((species) => {
    const relatedTrees = getTreesBySpeciesId(species.id)

    return {
      ...species,
      quantity: relatedTrees.length,
      treeIds: relatedTrees.map((tree) => tree.id),
    }
  })
}

export function searchByKeyword<T extends { name: string; scientificName?: string; scientific?: string; family?: string; description?: string; desc?: string }>(
  items: T[],
  keyword: string
) {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return items
  }

  return items.filter((item) =>
    [item.name, item.scientificName, item.scientific, item.family, item.description, item.desc]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedKeyword))
  )
}

export function getStatusLabel(status: TreeStatus) {
  switch (status) {
    case "healthy":
      return "Sinh trưởng tốt"
    case "needs-care":
      return "Cần chăm sóc"
    case "monitoring":
      return "Đang theo dõi"
  }
}

