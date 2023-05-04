import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { UpdateEmployeeSchema } from '@/validations'
import type { Employee } from '@prisma/client'

interface UpdateEmployeeResult {
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

export const updateEmployee = async (
  companyId: string,
  employeeId: string,
  body: unknown
): Promise<UpdateEmployeeResult> => {
  try {
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

    const employee = await prisma.employee.findFirst({
      where: {
        company_id: companyId,
        id: employeeId,
      },
    })

    if (!employee) {
      return {
        status: 404,
        success: false,
        message: `Employee ${employeeId} does not exist`,
      }
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        updated_at: new Date(),
        ...UpdateEmployeeSchema.parse(body),
      },
    })

    return {
      status: 200,
      success: true,
      data: updatedEmployee,
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
