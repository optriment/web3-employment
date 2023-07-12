import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import { BatchPaymentDTO } from '@/lib/dto/BatchPaymentDTO'
import { prisma } from '@/lib/prisma'
import { ValidationError } from '@/lib/validationError'
import { CreateBatchPaymentSchema } from '@/validations'

const fieldNames: { [key: string]: string } = {
  transaction_hash: 'Transaction hash',
  recipients: 'Recipients',
}

export const createBatchPayment = async (
  userId: string,
  body: unknown
): Promise<BatchPaymentDTO> => {
  try {
    const batchPaymentSchema = CreateBatchPaymentSchema.parse(body)

    // TODO: Validate that batchPaymentSchema.transaction_hash exists on blockchain network

    const batchPayment = await prisma.batchPayment.create({
      data: {
        userId: userId,
        transactionHash: batchPaymentSchema.transaction_hash,
        batchRecipients: {
          create: batchPaymentSchema.recipients.map((recipient) => ({
            recipientId: recipient.recipient_id,
            amount: recipient.payment_amount,
            walletAddress: recipient.wallet_address,
          })),
        },
      },
    })

    return BatchPaymentDTO.fromModel(batchPayment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(buildValidationErrors(error, fieldNames))
    }

    throw error
  }
}
