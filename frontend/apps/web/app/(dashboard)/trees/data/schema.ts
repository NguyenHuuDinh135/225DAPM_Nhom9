import { z } from "zod"

export const treeSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  condition: z.string().nullable(),
  treeTypeId: z.number(),
  treeTypeName: z.string().nullable().optional(),
  lastMaintenanceDate: z.string().nullable(),
})

export type Tree = z.infer<typeof treeSchema>

export const treeFormSchema = z.object({
  name: z.string().min(1, "Tên cây không được để trống"),
  treeTypeId: z.coerce.number().min(1, "Vui lòng chọn loại cây"),
  condition: z.string().optional(),
})

export type TreeFormValues = z.infer<typeof treeFormSchema>
