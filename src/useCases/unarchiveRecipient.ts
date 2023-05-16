import { ClientError } from '@/lib/clientError'
import { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { GROUP_DOES_NOT_EXIST, RECIPIENT_DOES_NOT_EXIST } from '@/lib/messages'
import { prisma } from '@/lib/prisma'

export const unarchiveRecipient = async (
  groupId: string,
  recipientId: string
): Promise<RecipientDTO> => {
  const group = await prisma.company.findFirst({
    where: {
      id: groupId,
    },
  })

  if (!group) {
    throw new ClientError(GROUP_DOES_NOT_EXIST.message, 404)
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

  if (!recipient.archived_at) {
    return RecipientDTO.fromModel(recipient)
  }

  const unarchivedRecipient = await prisma.employee.update({
    where: {
      id: recipientId,
    },
    data: {
      archived_at: null,
    },
  })

  return RecipientDTO.fromModel(unarchivedRecipient)
}
