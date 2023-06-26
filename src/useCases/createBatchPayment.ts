import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import { ClientError } from '@/lib/clientError'
import { BatchPaymentDTO } from '@/lib/dto/BatchPaymentDTO'
import { GROUP_DOES_NOT_EXIST, GROUP_IS_ARCHIVED } from '@/lib/messages'
import { prisma } from '@/lib/prisma'
import { ValidationError } from '@/lib/validationError'
import { CreateBatchPaymentSchema } from '@/validations'

const fieldNames: { [key: string]: string } = {
  transaction_hash: 'Transaction hash',
  recipients_count: 'Recipients count',
  total_amount: 'Total amount',
}

export const createBatchPayment = async (
  userId: string,
  groupId: string,
  body: unknown
): Promise<BatchPaymentDTO> => {
  try {
    const group = await prisma.group.findFirst({
      where: {
        userId: userId,
        id: groupId,
      },
    })

    if (!group) {
      throw new ClientError(GROUP_DOES_NOT_EXIST.message, 404)
    }

    if (group.archivedAt) {
      throw new ClientError(GROUP_IS_ARCHIVED.message, 400)
    }

    const batchPaymentSchema = CreateBatchPaymentSchema.parse(body)

    // TODO: Validate that batchPaymentSchema.transaction_hash exists on blockchain network

    const batchPayment = await prisma.batchPayment.create({
      data: {
        groupId: groupId,
        transactionHash: batchPaymentSchema.transaction_hash,
        recipientsCount: batchPaymentSchema.recipients_count,
        totalAmount: batchPaymentSchema.total_amount,
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
