import * as Sentry from '@sentry/nextjs'
import { METHOD_NOT_ALLOWED, UNHANDLED_ERROR } from '@/lib/messages'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/lib/types/api'
import type { NextApiRequest, NextApiResponse } from 'next'

interface StatusResponse {
  success: boolean
  status?: string
  message?: string
}

export type StatusApiResponse = ApiResponse<StatusResponse>

interface IDBStatusResponse {
  success: boolean
}

type DBStatusResponse = IDBStatusResponse[]

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<StatusApiResponse>
) => {
  if (req.method !== 'GET') {
    res.status(405)
    res.json({ success: false, ...METHOD_NOT_ALLOWED })
    return res.end()
  }

  try {
    const result: DBStatusResponse =
      await prisma.$queryRaw`SELECT true AS success`

    res.status(200)
    res.json({ success: result[0].success })
  } catch (err) {
    Sentry.captureException(err)

    res.status(500)
    res.json({
      success: false,
      ...UNHANDLED_ERROR,
    })
  } finally {
    res.end()
  }
}

export default handler
