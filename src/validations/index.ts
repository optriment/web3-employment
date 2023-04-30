import { z } from 'zod'

export const CreateCompanySchema = z.object({
  display_name: z.string().trim().min(2),
  comment: z.string().trim().optional(),
})
