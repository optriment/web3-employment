import { isAddress } from 'tronweb'
import { z } from 'zod'

const GroupSchema = z.object({
  display_name: z.string().trim().min(2),
  comment: z.string().trim().optional(),
})

export const CreateGroupSchema = GroupSchema
export const UpdateGroupSchema = GroupSchema

const RecipientSchema = z.object({
  display_name: z.string().trim().min(2),
  comment: z.string().trim().optional(),
  wallet_address: z
    .string()
    .trim()
    .refine((value) => isAddress(value), {
      message: 'Invalid wallet address',
    }),
  contacts: z.string().trim().optional(),
  salary: z.coerce.number().nonnegative().int().optional(),
})

export const CreateRecipientSchema = RecipientSchema
export const UpdateRecipientSchema = RecipientSchema

export const PaymentSchema = z.object({
  amount: z.coerce.number().int().positive(),
})

export const CreatePaymentSchema = z.object({
  transaction_hash: z.string().trim().min(2),
  amount: z.number().int().positive(),
})
