import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import { GroupDTO } from '@/lib/dto/GroupDTO'
import { prisma } from '@/lib/prisma'
import { ValidationError } from '@/lib/validationError'
import { CreateGroupSchema } from '@/validations'

// Define a dictionary object that maps field names to their corresponding human-readable names
const fieldNames: { [key: string]: string } = {
  display_name: 'Display name',
  comment: 'Comment',
}

export const createGroup = async (body: unknown): Promise<GroupDTO> => {
  try {
    const createdGroup = await prisma.company.create({
      data: CreateGroupSchema.parse(body),
    })

    return GroupDTO.fromModel(createdGroup)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(buildValidationErrors(error, fieldNames))
    }

    throw error
  }
}
