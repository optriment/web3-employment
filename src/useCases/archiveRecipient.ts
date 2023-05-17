import { ClientError } from '@/lib/clientError'
import { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { GROUP_DOES_NOT_EXIST, RECIPIENT_DOES_NOT_EXIST } from '@/lib/messages'
import { prisma } from '@/lib/prisma'

export const archiveRecipient = async (
  groupId: string,
  recipientId: string
): Promise<RecipientDTO> => {
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
    },
  })

  if (!group) {
    throw new ClientError(GROUP_DOES_NOT_EXIST.message, 404)
  }

  const recipient = await prisma.recipient.findFirst({
    where: {
      group_id: groupId,
      id: recipientId,
    },
  })

  if (!recipient) {
    throw new ClientError(RECIPIENT_DOES_NOT_EXIST.message, 404)
  }

  if (recipient.archived_at) {
    return RecipientDTO.fromModel(recipient)
  }

  const archivedRecipient = await prisma.recipient.update({
    where: {
      id: recipientId,
    },
    data: {
      archived_at: new Date(),
    },
  })

  return RecipientDTO.fromModel(archivedRecipient)
}
