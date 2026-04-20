import { z } from "zod"

export const planSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  creatorId: z.string(),
  approverId: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  status: z.string().nullable(),
  workCount: z.number(),
})

export type Plan = z.infer<typeof planSchema>

export const planFormSchema = z.object({
  name: z.string().min(1, "Tên kế hoạch không được để trống"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type PlanFormValues = z.infer<typeof planFormSchema>
