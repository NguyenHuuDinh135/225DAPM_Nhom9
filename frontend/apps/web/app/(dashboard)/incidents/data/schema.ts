import { z } from "zod"

export const incidentSchema = z.object({
  id: z.number(),
  treeId: z.number(),
  treeName: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  reportedDate: z.string(),
  reportedBy: z.string().nullable(),
})

export type Incident = z.infer<typeof incidentSchema>

export const STATUSES = ["Pending", "InProgress", "Resolved"] as const
export type IncidentStatus = (typeof STATUSES)[number]
