import { GroupDTO } from '@/lib/dto/GroupDTO'
import { prisma } from '@/lib/prisma'

export const getGroups = async (): Promise<GroupDTO[]> => {
  const groups = await prisma.group.findMany()

  return groups.map((group) => GroupDTO.fromModel(group))
}
