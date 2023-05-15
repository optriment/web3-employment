import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import {
  DATABASE_ERROR,
  DATABASE_IS_NOT_READY,
  UNHANDLED_ERROR,
} from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import type {
  CompanyArchiveApiResponse,
  CompanyWithEmployeesApiResponse,
} from '@/pages/api/companies/[id]'
import type { EmployeeCreateApiResponse } from '@/pages/api/companies/[id]/employees'
import type { EmployeeUpdateApiResponse } from '@/pages/api/companies/[id]/employees/[employee_id]'
import type { PaymentCreateApiResponse } from '@/pages/api/companies/[id]/employees/[employee_id]/payment'
import type { CompanyUnarchiveApiResponse } from '@/pages/api/companies/[id]/unarchive'
import type { NextApiResponse } from 'next'
import type { ZodError } from 'zod'

const BASE_URL = '/api'

export class APIError extends Error {
  validationErrors: string[]

  constructor(message: string, validationErrors: string[]) {
    super(message)
    this.name = 'APIError'
    this.validationErrors = validationErrors
  }
}

const defaultHeaders = {
  'Content-Type': 'application/json',
}

// NOTE: Used on frontend side only
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    return response.json() as Promise<T>
  }

  const errorData: ApiResponse<T> = await response.json()

  if (response.status === 422 || response.status === 400) {
    if (errorData.validation_errors) {
      throw new APIError(errorData.message || '', errorData.validation_errors)
    }
  }

  throw new Error(errorData.message)
}

// NOTE: Used on frontend side only
const api = {
  getCompanyById: async (
    companyId: string
  ): Promise<CompanyWithEmployeesApiResponse> => {
    const payload = {
      method: 'GET',
      headers: {
        ...defaultHeaders,
      },
    }

    const response = await fetch(`${BASE_URL}/companies/${companyId}`, payload)

    return handleResponse<CompanyWithEmployeesApiResponse>(response)
  },

  archiveCompany: async (
    companyId: string
  ): Promise<CompanyArchiveApiResponse> => {
    const payload = {
      method: 'DELETE',
      headers: {
        ...defaultHeaders,
      },
    }

    const response = await fetch(`${BASE_URL}/companies/${companyId}`, payload)

    return handleResponse<CompanyArchiveApiResponse>(response)
  },

  unarchiveCompany: async (
    companyId: string
  ): Promise<CompanyUnarchiveApiResponse> => {
    const payload = {
      method: 'POST',
      headers: {
        ...defaultHeaders,
      },
    }

    const response = await fetch(
      `${BASE_URL}/companies/${companyId}/unarchive`,
      payload
    )

    return handleResponse<CompanyUnarchiveApiResponse>(response)
  },

  addEmployeeToCompany: async (
    companyId: string,
    body: string
  ): Promise<EmployeeCreateApiResponse> => {
    const payload = {
      method: 'POST',
      headers: {
        ...defaultHeaders,
      },
      body,
    }

    const response = await fetch(
      `${BASE_URL}/companies/${companyId}/employees`,
      payload
    )

    return handleResponse<EmployeeCreateApiResponse>(response)
  },

  updateEmployee: async (
    companyId: string,
    employeeId: string,
    body: string
  ): Promise<EmployeeUpdateApiResponse> => {
    const payload = {
      method: 'PUT',
      headers: {
        ...defaultHeaders,
      },
      body,
    }

    const response = await fetch(
      `${BASE_URL}/companies/${companyId}/employees/${employeeId}`,
      payload
    )

    return handleResponse<EmployeeUpdateApiResponse>(response)
  },

  addPaymentToEmployee: async (
    companyId: string,
    employeeId: string,
    body: string
  ): Promise<PaymentCreateApiResponse> => {
    const payload = {
      method: 'POST',
      headers: {
        ...defaultHeaders,
      },
      body,
    }

    const response = await fetch(
      `${BASE_URL}/companies/${companyId}/employees/${employeeId}/payment`,
      payload
    )

    return handleResponse<PaymentCreateApiResponse>(response)
  },
}

export default api

// NOTE: Used on backend side only
export const buildValidationErrors = (
  error: ZodError,
  fieldNames: { [key: string]: string }
): string[] => {
  const errors: string[] = []

  const fieldErrors = error.flatten().fieldErrors

  Object.keys(fieldErrors).forEach((key) => {
    const fieldName = fieldNames[key] || key
    const fieldError = fieldErrors[key]

    if (!fieldError) {
      throw new Error(`${key} is not found in fieldError`)
    }

    if (fieldError.length !== 1) {
      throw new Error(
        `Error for key ${key} has unexpected number of errors: ${fieldError.length}`
      )
    }

    const errorMessage = `${fieldName}: ${fieldError[0]}`
    errors.push(errorMessage)
  })

  return errors
}

// NOTE: Used on backend side only
export const captureAPIError = async (e: unknown, res: NextApiResponse) => {
  Sentry.captureException(e)

  res.status(500)

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code) {
      case 'P2023': {
        res.json({ success: false, message: 'Invalid UUID' })
        break
      }
      default:
        res.json({ success: false, ...DATABASE_ERROR })
    }
  } else if (e instanceof Prisma.PrismaClientInitializationError) {
    res.json({ success: false, ...DATABASE_IS_NOT_READY })
  } else {
    res.json({ success: false, ...UNHANDLED_ERROR })
  }

  return res.end()
}
