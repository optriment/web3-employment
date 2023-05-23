import { ClientError } from '@/lib/clientError'
import { GroupDTO } from '@/lib/dto/GroupDTO'
import { GROUP_DOES_NOT_EXIST } from '@/lib/messages'
import { prisma } from '@/lib/prisma'

export const unarchiveGroup = async (
  userId: string,
  groupId: string
): Promise<GroupDTO> => {
  const group = await prisma.group.findFirst({
    where: {
      userId: userId,
      id: groupId,
    },
  })

  if (!group) {
    throw new ClientError(GROUP_DOES_NOT_EXIST.message, 404)
  }

  if (!group.archived_at) {
    return GroupDTO.fromModel(group)
  }

  const unarchivedGroup = await prisma.group.update({
    where: {
      id: groupId,
    },
    data: {
      archived_at: null,
    },
  })

  return GroupDTO.fromModel(unarchivedGroup)
}
