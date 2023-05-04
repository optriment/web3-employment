import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { CreateEmployeeSchema } from '@/validations'
import type { Employee } from '@prisma/client'

interface CreateEmployeeResult {
  status: number
  success: boolean
  data?: Employee
  validationErrors?: string[]
  message?: string
}

// Define a dictionary object that maps field names to their corresponding human-readable names
const fieldNames: { [key: string]: string } = {
  display_name: 'Display name',
  comment: 'Comment',
  wallet_address: 'Wallet address',
  contacts: 'Contacts',
  salary: 'Salary',
}

export const createEmployee = async (
  companyId: string,
  body: unknown
): Promise<CreateEmployeeResult> => {
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
    },
  })

  if (!company) {
    return {
      status: 404,
      success: false,
      message: `Company ${companyId} does not exist`,
    }
  }

  try {
    const employee = await prisma.employee.create({
      data: {
        company_id: companyId,
        ...CreateEmployeeSchema.parse(body),
      },
    })

    return {
      status: 201,
      success: true,
      data: employee,
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
