import { GroupDTO } from '@/lib/dto/GroupDTO'
import { prisma } from '@/lib/prisma'

export const getGroups = async (userId: string): Promise<GroupDTO[]> => {
  const groups = await prisma.group.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return groups.map((group) => GroupDTO.fromModel(group))
}
