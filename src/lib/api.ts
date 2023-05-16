import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import {
  DATABASE_ERROR,
  DATABASE_IS_NOT_READY,
  UNHANDLED_ERROR,
} from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import type {
  GroupCreateApiResponse,
  GroupGetApiResponse,
} from '@/pages/api/groups'
import type {
  GroupArchiveApiResponse,
  GroupUpdateApiResponse,
  GroupWithRecipientsApiResponse,
} from '@/pages/api/groups/[id]'
import type { GroupPaymentsApiResponse } from '@/pages/api/groups/[id]/payments'
import type { RecipientCreateApiResponse } from '@/pages/api/groups/[id]/recipients'
import type {
  RecipientArchiveApiResponse,
  RecipientUpdateApiResponse,
} from '@/pages/api/groups/[id]/recipients/[recipient_id]'
import type { PaymentCreateApiResponse } from '@/pages/api/groups/[id]/recipients/[recipient_id]/payment'
import type { RecipientUnarchiveApiResponse } from '@/pages/api/groups/[id]/recipients/[recipient_id]/unarchive'
import type { GroupUnarchiveApiResponse } from '@/pages/api/groups/[id]/unarchive'
import { ClientError } from './clientError'
import { ValidationError } from './validationError'
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
  addGroup: async (body: string): Promise<GroupCreateApiResponse> => {
    const payload = {
      method: 'POST',
      headers: {
        ...defaultHeaders,
      },
      body,
    }

    const response = await fetch(`${BASE_URL}/groups`, payload)

    return handleResponse<GroupCreateApiResponse>(response)
  },

  updateGroup: async (
    groupId: string,
    body: string
  ): Promise<GroupUpdateApiResponse> => {
    const payload = {
      method: 'PUT',
      headers: {
        ...defaultHeaders,
      },
      body,
    }

    const response = await fetch(`${BASE_URL}/groups/${groupId}`, payload)

    return handleResponse<GroupUpdateApiResponse>(response)
  },

  getGroups: async (): Promise<GroupGetApiResponse> => {
    const payload = {
      method: 'GET',
      headers: {
        ...defaultHeaders,
      },
    }

    const response = await fetch(`${BASE_URL}/groups`, payload)

    return handleResponse<GroupGetApiResponse>(response)
  },

  getGroupById: async (
    groupId: string
  ): Promise<GroupWithRecipientsApiResponse> => {
    const payload = {
      method: 'GET',
      headers: {
        ...defaultHeaders,
      },
    }

    const response = await fetch(`${BASE_URL}/groups/${groupId}`, payload)

    return handleResponse<GroupWithRecipientsApiResponse>(response)
  },

  archiveGroup: async (groupId: string): Promise<GroupArchiveApiResponse> => {
    const payload = {
      method: 'DELETE',
      headers: {
        ...defaultHeaders,
      },
    }

    const response = await fetch(`${BASE_URL}/groups/${groupId}`, payload)

    return handleResponse<GroupArchiveApiResponse>(response)
  },

  unarchiveGroup: async (
    groupId: string
  ): Promise<GroupUnarchiveApiResponse> => {
    const payload = {
      method: 'POST',
      headers: {
        ...defaultHeaders,
      },
    }

    const response = await fetch(
      `${BASE_URL}/groups/${groupId}/unarchive`,
      payload
    )

    return handleResponse<GroupUnarchiveApiResponse>(response)
  },

  addRecipientToGroup: async (
    groupId: string,
    body: string
  ): Promise<RecipientCreateApiResponse> => {
    const payload = {
      method: 'POST',
      headers: {
        ...defaultHeaders,
      },
      body,
    }

    const response = await fetch(
      `${BASE_URL}/groups/${groupId}/recipients`,
      payload
    )

    return handleResponse<RecipientCreateApiResponse>(response)
  },

  updateRecipient: async (
    groupId: string,
    recipientId: string,
    body: string
  ): Promise<RecipientUpdateApiResponse> => {
    const payload = {
      method: 'PUT',
      headers: {
        ...defaultHeaders,
      },
      body,
    }

    const response = await fetch(
      `${BASE_URL}/groups/${groupId}/recipients/${recipientId}`,
      payload
    )

    return handleResponse<RecipientUpdateApiResponse>(response)
  },

  addPaymentToRecipient: async (
    groupId: string,
    recipientId: string,
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
      `${BASE_URL}/groups/${groupId}/recipients/${recipientId}/payment`,
      payload
    )

    return handleResponse<PaymentCreateApiResponse>(response)
  },

  archiveRecipient: async (
    groupId: string,
    recipientId: string
  ): Promise<RecipientArchiveApiResponse> => {
    const payload = {
      method: 'DELETE',
      headers: {
        ...defaultHeaders,
      },
    }

    const response = await fetch(
      `${BASE_URL}/groups/${groupId}/recipients/${recipientId}`,
      payload
    )

    return handleResponse<RecipientArchiveApiResponse>(response)
  },

  unarchiveRecipient: async (
    groupId: string,
    recipientId: string
  ): Promise<RecipientUnarchiveApiResponse> => {
    const payload = {
      method: 'POST',
      headers: {
        ...defaultHeaders,
      },
    }

    const response = await fetch(
      `${BASE_URL}/groups/${groupId}/recipients/${recipientId}/unarchive`,
      payload
    )

    return handleResponse<RecipientUnarchiveApiResponse>(response)
  },

  getGroupPayments: async (
    groupId: string
  ): Promise<GroupPaymentsApiResponse> => {
    const payload = {
      method: 'GET',
      headers: {
        ...defaultHeaders,
      },
    }

    const response = await fetch(
      `${BASE_URL}/groups/${groupId}/payments`,
      payload
    )

    return handleResponse<GroupPaymentsApiResponse>(response)
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

  if (e instanceof ValidationError) {
    res.status(422)
    res.json({
      success: false,
      validation_errors: e.validationErrors,
    })
    return res.end()
  }

  if (e instanceof ClientError) {
    res.status(e.status)
    res.json({
      success: false,
      message: e.message,
    })
    return res.end()
  }

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
