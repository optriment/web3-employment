import { ClientError } from '@/lib/clientError'
import { GroupDTO } from '@/lib/dto/GroupDTO'
import { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { GROUP_DOES_NOT_EXIST } from '@/lib/messages'
import { prisma } from '@/lib/prisma'

interface GroupWithRecipients {
  group: GroupDTO
  recipients: RecipientDTO[]
}

export const getGroupWithRecipients = async (
  id: string
): Promise<GroupWithRecipients> => {
  const group = await prisma.company.findFirst({
    where: {
      id: id,
    },
  })

  if (!group) {
    throw new ClientError(GROUP_DOES_NOT_EXIST.message, 404)
  }

  const recipients = await prisma.employee.findMany({
    where: {
      company_id: id,
    },
  })

  return {
    group: GroupDTO.fromModel(group),
    recipients: recipients.map((recipient) =>
      RecipientDTO.fromModel(recipient)
    ),
  }
}
