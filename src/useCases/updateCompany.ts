import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { UpdateCompanySchema } from '@/validations'
import type { Company } from '@prisma/client'

interface UpdateCompanyResult {
  status: number
  success: boolean
  data?: Company
  validationErrors?: string[]
  message?: string
}

// Define a dictionary object that maps field names to their corresponding human-readable names
const fieldNames: { [key: string]: string } = {
  display_name: 'Display name',
  comment: 'Comment',
}

export const updateCompany = async (
  id: string,
  body: unknown
): Promise<UpdateCompanyResult> => {
  try {
    const company = await prisma.company.findFirst({
      where: {
        id: id,
      },
    })

    if (!company) {
      return {
        status: 404,
        success: false,
        message: `Company ${id} does not exist`,
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        updated_at: new Date(),
        ...UpdateCompanySchema.parse(body),
      },
    })

    return {
      status: 200,
      success: true,
      data: updatedCompany,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: 422,
        success: false,
        validationErrors: buildValidationErrors(error, fieldNames),
      }
    }

    throw error
  }
}
