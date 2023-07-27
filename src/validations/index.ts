import { z } from 'zod'
import { tronWeb } from '@/lib/tronweb'

const GroupSchema = z.object({
  display_name: z.string().trim().min(2),
  comment: z.string().trim().optional(),
})

export const CreateGroupSchema = GroupSchema
export const UpdateGroupSchema = GroupSchema

export const RecipientSchema = z.object({
  display_name: z.string().trim().min(2),
  comment: z.string().trim().optional(),
  wallet_address: z
    .string()
    .trim()
    .refine((value) => tronWeb.isAddress(value), {
      message: 'Invalid wallet address',
    }),
  contacts: z.string().trim().optional(),
  salary: z.coerce
    .number()
    .nonnegative()
    .refine(
      (value) => {
        // Skip validation for non-numeric or negative values
        if (typeof value !== 'number' || value < 0) {
          return true
        }

        const regex = /^\d+(\.\d{1,6})?$/
        return regex.test(value.toString())
      },
      {
        message: 'Invalid salary format',
      }
    )
    .optional(),
})

export const CreateRecipientSchema = z.object({
  display_name: z.string().trim().min(2),
  comment: z.string().trim().optional(),
  wallet_address: z
    .string()
    .trim()
    .refine((value) => tronWeb.isAddress(value), {
      message: 'Invalid wallet address',
    }),
  contacts: z.string().trim().optional(),
  salary: z.coerce.number().int().nonnegative().optional(),
})

export const UpdateRecipientSchema = CreateRecipientSchema

export const PaymentSchema = z.object({
  amount: z.coerce
    .number()
    .positive()
    .refine(
      (value) => {
        // Skip validation for non-numeric or non-positive values
        if (typeof value !== 'number' || value <= 0) {
          return true
        }

        const regex = /^\d+(\.\d{1,6})?$/
        return regex.test(value.toString())
      },
      {
        message: 'Invalid amount format',
      }
    ),
})

export const CreatePaymentSchema = z.object({
  transaction_hash: z.string().trim().min(2),
  amount: z.coerce.number().int().positive(),
})

export const CreateBatchPaymentSchema = z.object({
  transaction_hash: z.string().trim().min(2),
  recipients: z
    .array(
      z.object({
        recipient_id: z.string().trim().min(2),
        payment_amount: z.coerce.number().int().positive(),
        wallet_address: z
          .string()
          .trim()
          .refine((value) => tronWeb.isAddress(value), {
            message: 'Invalid wallet address',
          }),
      })
    )
    .nonempty(),
})
