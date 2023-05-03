import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { CreatePaymentSchema } from '@/validations'
import type { Payment } from '@prisma/client'

interface CreatePaymentResult {
  status: number
  success: boolean
  data?: Payment
  validationErrors?: string[]
  message?: string
}

// Define a dictionary object that maps field names to their corresponding human-readable names
const fieldNames: { [key: string]: string } = {
  transaction_hash: 'Transaction hash',
  amount: 'Amount',
}

export const createPayment = async (
  companyId: string,
  employeeId: string,
  body: unknown
): Promise<CreatePaymentResult> => {
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

  if (company.archived_at) {
    return {
      status: 400,
      success: false,
      message: `Company ${companyId} is archived`,
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

  if (!employee.wallet_address || employee.wallet_address.trim() === '') {
    return {
      status: 400,
      success: false,
      message: `Employee ${employeeId} doesn't have wallet`,
    }
  }

  if (employee.archived_at) {
    return {
      status: 400,
      success: false,
      message: `Employee ${employeeId} is archived`,
    }
  }

  try {
    const paymentSchema = CreatePaymentSchema.parse(body)

    // TODO: Validate that paymentSchema.transaction_hash exists on blockchain network

    const payment = await prisma.payment.create({
      data: {
        employee_id: employeeId,
        wallet_address: employee.wallet_address,
        ...paymentSchema,
      },
    })

    return {
      status: 201,
      success: true,
      data: payment,
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
