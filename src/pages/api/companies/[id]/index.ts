import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import {
  DATABASE_ERROR,
  METHOD_NOT_ALLOWED,
  UNHANDLED_ERROR,
} from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { archiveCompany } from '@/useCases/archiveCompany'
import { getCompanyWithEmployees } from '@/useCases/getCompanyWithEmployees'
import { updateCompany } from '@/useCases/updateCompany'
import type { Company, Employee } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface CompanyWithEmployees {
  company: Company
  employees: Employee[]
}

export type CompanyWithEmployeesApiResponse = ApiResponse<CompanyWithEmployees>

export type CompanyUpdateApiResponse = ApiResponse<Company>

export type CompanyArchiveApiResponse = ApiResponse<Company>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return await handleGET(req, res)

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

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse<CompanyWithEmployeesApiResponse>
) => {
  try {
    const useCase = await getCompanyWithEmployees(req.query.id as string)

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

const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse<CompanyUpdateApiResponse>
) => {
  try {
    const useCase = await updateCompany(req.query.id as string, req.body)

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
  res: NextApiResponse<CompanyArchiveApiResponse>
) => {
  try {
    const archivedCompany = await archiveCompany(req.query.id as string)
    if (!archivedCompany.success) {
      res.status(400)
      return res.json({
        success: false,
        message: archivedCompany.message,
      })
    }
    res.status(200)
    res.json({ success: true, message: archivedCompany.message })

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
