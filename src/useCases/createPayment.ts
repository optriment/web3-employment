import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import { ClientError } from '@/lib/clientError'
import { PaymentDTO } from '@/lib/dto/PaymentDTO'
import {
  GROUP_DOES_NOT_EXIST,
  GROUP_IS_ARCHIVED,
  RECIPIENT_DOES_NOT_EXIST,
  RECIPIENT_DOES_NOT_HAVE_WALLET,
  RECIPIENT_IS_ARCHIVED,
} from '@/lib/messages'
import { prisma } from '@/lib/prisma'
import { ValidationError } from '@/lib/validationError'
import { CreatePaymentSchema } from '@/validations'

// Define a dictionary object that maps field names to their corresponding human-readable names
const fieldNames: { [key: string]: string } = {
  transaction_hash: 'Transaction hash',
  amount: 'Amount',
}

export const createPayment = async (
  groupId: string,
  recipientId: string,
  body: unknown
): Promise<PaymentDTO> => {
  try {
    const group = await prisma.company.findFirst({
      where: {
        id: groupId,
      },
    })

    if (!group) {
      throw new ClientError(GROUP_DOES_NOT_EXIST.message, 404)
    }

    if (group.archived_at) {
      throw new ClientError(GROUP_IS_ARCHIVED.message, 400)
    }

    const recipient = await prisma.employee.findFirst({
      where: {
        company_id: groupId,
        id: recipientId,
      },
    })

    if (!recipient) {
      throw new ClientError(RECIPIENT_DOES_NOT_EXIST.message, 404)
    }

    if (!recipient.wallet_address || recipient.wallet_address.trim() === '') {
      throw new ClientError(RECIPIENT_DOES_NOT_HAVE_WALLET.message, 400)
    }

    if (recipient.archived_at) {
      throw new ClientError(RECIPIENT_IS_ARCHIVED.message, 400)
    }

    const paymentSchema = CreatePaymentSchema.parse(body)

    // TODO: Validate that paymentSchema.transaction_hash exists on blockchain network

    const payment = await prisma.payment.create({
      data: {
        employee_id: recipientId,
        wallet_address: recipient.wallet_address,
        ...paymentSchema,
      },
    })

    return PaymentDTO.fromModel(payment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(buildValidationErrors(error, fieldNames))
    }

    throw error
  }
}
