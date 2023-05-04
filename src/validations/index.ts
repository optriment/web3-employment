import { z } from 'zod'

const CompanySchema = z.object({
  display_name: z.string().trim().min(2),
  comment: z.string().trim().optional(),
})

export const CreateCompanySchema = CompanySchema
export const UpdateCompanySchema = CompanySchema

export const CreateEmployeeSchema = z.object({
  display_name: z.string().trim().min(2),
  comment: z.string().trim().optional(),
  wallet_address: z.string().trim().optional(),
  contacts: z.string().trim().optional(),
  salary: z.coerce.number().nonnegative().int().optional(),
})

export const PaymentSchema = z.object({
  amount: z.coerce.number().int().positive(),
})

export const CreatePaymentSchema = z.object({
  transaction_hash: z.string().trim().min(2),
  amount: z.number().int().positive(),
})
