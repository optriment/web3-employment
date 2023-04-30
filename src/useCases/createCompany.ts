import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { CreateCompanySchema } from '@/validations'
import type { Company } from '@prisma/client'

interface CreateCompanyResult {
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

export const createCompany = async (
  body: unknown
): Promise<CreateCompanyResult> => {
  try {
    const company = await prisma.company.create({
      data: CreateCompanySchema.parse(body),
    })

    return {
      status: 201,
      success: true,
      data: company,
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
