import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import * as z from 'zod'
import { buildValidationErrors } from '@/lib/api'
import {
  DATABASE_ERROR,
  METHOD_NOT_ALLOWED,
  UNHANDLED_ERROR,
} from '@/lib/messages'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/lib/types/api'
import { CreateCompanySchema } from '@/validations'
import type { Company } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export type CompanyCreateApiResponse = ApiResponse<Company>

type NewCompany = z.infer<typeof CreateCompanySchema>

// Define a dictionary object that maps field names to their corresponding human-readable names
const fieldNames: { [key: string]: string } = {
  display_name: 'Display name',
  comment: 'Comment',
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<CompanyCreateApiResponse>
) => {
  if (req.method !== 'POST') {
    res.status(405)
    res.json({ success: false, ...METHOD_NOT_ALLOWED })
    return res.end()
  }

  let newCompanyData: NewCompany

  try {
    newCompanyData = CreateCompanySchema.parse(req.body)
  } catch (error) {
    Sentry.captureException(error)

    if (error instanceof z.ZodError) {
      res.status(422)
      res.json({
        success: false,
        validation_errors: buildValidationErrors(error, fieldNames),
      })
      return res.end()
    }

    res.status(500)
    res.json({ success: false, ...UNHANDLED_ERROR })
    return res.end()
  }

  try {
    const company = await prisma.company.create({ data: newCompanyData })

    res.status(201)
    res.json({ success: true, data: company })
  } catch (err) {
    Sentry.captureException(err)
    res.status(500)

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      res.json({
        success: false,
        ...DATABASE_ERROR,
      })
    } else {
      res.json({
        success: false,
        ...UNHANDLED_ERROR,
      })
    }
  } finally {
    res.end()
  }
}

export default handler
