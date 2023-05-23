import { ClientError } from '@/lib/clientError'
import { GroupDTO } from '@/lib/dto/GroupDTO'
import { PaymentDTO } from '@/lib/dto/PaymentDTO'
import { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { GROUP_DOES_NOT_EXIST } from '@/lib/messages'
import { prisma } from '@/lib/prisma'

interface GroupPayments {
  group: GroupDTO
  payments: PaymentDTO[]
  recipients: RecipientDTO[]
}

export const getGroupPayments = async (
  userId: string,
  groupId: string
): Promise<GroupPayments> => {
  const group = await prisma.group.findFirst({
    where: {
      userId: userId,
      id: groupId,
    },
  })

  if (!group) {
    throw new ClientError(GROUP_DOES_NOT_EXIST.message, 404)
  }

  const recipients = await prisma.recipient.findMany({
    where: {
      group_id: groupId,
    },
  })

  const payments = await prisma.payment.findMany({
    where: {
      recipient_id: {
        in: recipients.map((recipient) => recipient.id),
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  return {
    group: GroupDTO.fromModel(group),
    payments: payments.map((payment) => PaymentDTO.fromModel(payment)),
    recipients: recipients.map((recipient) =>
      RecipientDTO.fromModel(recipient)
    ),
  }
}
