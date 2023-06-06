import { ClientError } from '@/lib/clientError'
import { UserDTO } from '@/lib/dto/UserDTO'
import { USER_DOES_NOT_EXIST } from '@/lib/messages'
import { prisma } from '@/lib/prisma'

export const deleteUserAccount = async (userId: string): Promise<UserDTO> => {
  const user = await prisma.user.delete({
    where: {
      id: userId,
    },
  })

  if (!user) {
    throw new ClientError(USER_DOES_NOT_EXIST.message, 404)
  }

  return UserDTO.fromModel(user)
}
