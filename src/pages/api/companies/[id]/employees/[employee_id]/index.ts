import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import {
  DATABASE_ERROR,
  METHOD_NOT_ALLOWED,
  UNHANDLED_ERROR,
} from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { archiveEmployee } from '@/useCases/archiveEmployee'
import { updateEmployee } from '@/useCases/updateEmployee'
import type { Employee } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export type EmployeeUpdateApiResponse = ApiResponse<Employee>

export type EmployeeArchiveApiResponse = ApiResponse<Employee>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'PUT':
      return await handlePUT(req, res)

    case 'DELETE':
      return await handleDELETE(req, res)

    default:
      res.status(405)
      res.json({ success: false, ...METHOD_NOT_ALLOWED })
      return res.end()
  }
}

const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse<EmployeeUpdateApiResponse>
) => {
  try {
    const useCase = await updateEmployee(
      req.query.id as string,
      req.query.employee_id as string,
      req.body
    )

    res.status(useCase.status)

    if (useCase.success) {
      res.json({ success: true, data: useCase.data })
    } else {
      res.json({
        success: false,
        message: useCase.message,
        validation_errors: useCase.validationErrors,
      })
    }

    return res.end()
  } catch (e) {
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
    } else {
      res.json({ success: false, ...UNHANDLED_ERROR })
    }

    return res.end()
  }
}

const handleDELETE = async (
  req: NextApiRequest,
  res: NextApiResponse<EmployeeArchiveApiResponse>
) => {
  try {
    const useCase = await archiveEmployee(
      req.query.id as string,
      req.query.employee_id as string
    )

    res.status(useCase.status)

    if (useCase.success) {
      res.json({ success: true, data: useCase.data })
    } else {
      res.json({
        success: false,
        message: useCase.message,
      })
    }

    return res.end()
  } catch (e) {
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
    } else {
      res.json({ success: false, ...UNHANDLED_ERROR })
    }

    return res.end()
  }
}

export default handler
