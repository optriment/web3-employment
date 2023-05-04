import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import {
  DATABASE_ERROR,
  METHOD_NOT_ALLOWED,
  UNHANDLED_ERROR,
} from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { createCompany } from '@/useCases/createCompany'
import { getCompanies } from '@/useCases/getCompanies'
import type { Company } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export type CompanyCreateApiResponse = ApiResponse<Company>
export type CompanyGetApiResponse = ApiResponse<Company[]>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      return await handlePOST(req, res)
    case 'GET':
      return await handleGET(req, res)
    default:
      res.status(405)
      res.json({ success: false, ...METHOD_NOT_ALLOWED })
      return res.end()
  }
}

const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse<CompanyCreateApiResponse>
) => {
  try {
    const useCase = await createCompany(req.body)
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
      res.json({ success: false, ...DATABASE_ERROR })
    } else {
      res.json({ success: false, ...UNHANDLED_ERROR })
    }

    return res.end()
  }
}

const handleGET = async (
  _req: NextApiRequest,
  res: NextApiResponse<CompanyGetApiResponse>
) => {
  try {
    const useCase = await getCompanies()

    res.status(useCase.status)
    if (useCase.success) {
      res.json({ success: true, data: useCase.data })
    } else {
      res.json({ success: false, message: useCase.message })
    }
  } catch (e) {
    Sentry.captureException(e)

    res.status(500)

    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      res.json({ success: false, ...DATABASE_ERROR })
    } else {
      res.json({ success: false, ...UNHANDLED_ERROR })
    }

    return res.end()
  }
}
export default handler
