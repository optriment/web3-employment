import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import { ClientError } from '@/lib/clientError'
import { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { GROUP_DOES_NOT_EXIST } from '@/lib/messages'
import { prisma } from '@/lib/prisma'
import { ValidationError } from '@/lib/validationError'
import { CreateRecipientSchema } from '@/validations'

// Define a dictionary object that maps field names to their corresponding human-readable names
const fieldNames: { [key: string]: string } = {
  display_name: 'Display name',
  comment: 'Comment',
  wallet_address: 'Wallet address',
  contacts: 'Contacts',
  salary: 'Salary',
}

export const createRecipient = async (
  userId: string,
  groupId: string,
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

    const schema = CreateRecipientSchema.parse(body)

    const recipient = await prisma.recipient.create({
      data: {
        groupId: groupId,
        displayName: schema.display_name,
        comment: schema.comment,
        walletAddress: schema.wallet_address,
        contacts: schema.contacts,
        salary: schema.salary,
      },
    })

    return RecipientDTO.fromModel(recipient)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(buildValidationErrors(error, fieldNames))
    }

    throw error
  }
}
