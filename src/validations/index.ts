import { z } from 'zod'

export const CreateCompanySchema = z.object({
  display_name: z.string().trim().min(2),
  comment: z.string().trim().optional(),
})

export const CreateEmployeeSchema = z.object({
  display_name: z.string().trim().min(2),
  comment: z.string().trim().optional(),
  wallet_address: z.string().trim().optional(),
  contacts: z.string().trim().optional(),
})

export const PaymentSchema = z.object({
  amount: z.coerce.number().int().positive(),
})

export const CreatePaymentSchema = z.object({
  transaction_hash: z.string().trim().min(2),
  amount: z.number().int().positive(),
})
