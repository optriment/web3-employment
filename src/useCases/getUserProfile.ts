import { ClientError } from '@/lib/clientError'
import { UserDTO } from '@/lib/dto/UserDTO'
import { GROUP_DOES_NOT_EXIST } from '@/lib/messages'
import { prisma } from '@/lib/prisma'

export const getUserProfile = async (userId: string): Promise<UserDTO> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    throw new ClientError(GROUP_DOES_NOT_EXIST.message, 404)
  }

  return UserDTO.fromModel(user)
}
