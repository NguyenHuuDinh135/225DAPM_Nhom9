import { z } from "zod"

export const workItemSchema = z.object({
  id: z.number(),
  workTypeId: z.number(),
  workTypeName: z.string().nullable(),
  planId: z.number(),
  planName: z.string().nullable(),
  creatorId: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  status: z.string(),
  statusName: z.string(),
})

export type WorkItem = z.infer<typeof workItemSchema>
