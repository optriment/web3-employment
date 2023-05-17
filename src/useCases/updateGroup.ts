import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import { ClientError } from '@/lib/clientError'
import { GroupDTO } from '@/lib/dto/GroupDTO'
import { GROUP_DOES_NOT_EXIST } from '@/lib/messages'
import { prisma } from '@/lib/prisma'
import { ValidationError } from '@/lib/validationError'
import { UpdateGroupSchema } from '@/validations'

// Define a dictionary object that maps field names to their corresponding human-readable names
const fieldNames: { [key: string]: string } = {
  display_name: 'Display name',
  comment: 'Comment',
}

export const updateGroup = async (
  id: string,
  body: unknown
): Promise<GroupDTO> => {
  try {
    const group = await prisma.company.findFirst({
      where: {
        id: id,
      },
    })

    if (!group) {
      throw new ClientError(GROUP_DOES_NOT_EXIST.message, 404)
    }

    const updatedGroup = await prisma.company.update({
      where: { id: group.id },
      data: {
        updated_at: new Date(),
        ...UpdateGroupSchema.parse(body),
      },
    })

    return GroupDTO.fromModel(updatedGroup)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(buildValidationErrors(error, fieldNames))
    }

    throw error
  }
}