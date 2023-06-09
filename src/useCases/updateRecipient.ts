import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import { ClientError } from '@/lib/clientError'
import { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { GROUP_DOES_NOT_EXIST, RECIPIENT_DOES_NOT_EXIST } from '@/lib/messages'
import { prisma } from '@/lib/prisma'
import { ValidationError } from '@/lib/validationError'
import { UpdateRecipientSchema } from '@/validations'

// Define a dictionary object that maps field names to their corresponding human-readable names
const fieldNames: { [key: string]: string } = {
  display_name: 'Display name',
  comment: 'Comment',
  wallet_address: 'Wallet address',
  contacts: 'Contacts',
  salary: 'Salary',
}

export const updateRecipient = async (
  userId: string,
  groupId: string,
  recipientId: string,
  body: unknown
): Promise<RecipientDTO> => {
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

    const recipient = await prisma.recipient.findFirst({
      where: {
        groupId: groupId,
        id: recipientId,
      },
    })

    if (!recipient) {
      throw new ClientError(RECIPIENT_DOES_NOT_EXIST.message, 404)
    }

    const schema = UpdateRecipientSchema.parse(body)

    const updatedRecipient = await prisma.recipient.update({
      where: { id: recipient.id },
      data: {
        updatedAt: new Date(),
        displayName: schema.display_name,
        comment: schema.comment,
        walletAddress: schema.wallet_address,
        contacts: schema.contacts,
        salary: schema.salary,
      },
    })

    return RecipientDTO.fromModel(updatedRecipient)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(buildValidationErrors(error, fieldNames))
    }

    throw error
  }
}
