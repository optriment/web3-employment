import { captureAPIError } from '@/lib/api'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/lib/types/api'
import type { NextApiRequest, NextApiResponse } from 'next'

interface Stats {
  [date: string]: {
    [provider: string]: number
  }
}

export type StatusApiResponse = ApiResponse<Stats>

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
    const result: { date: string; provider: string; count: bigint }[] =
      await prisma.$queryRaw`
        SELECT
          DATE_TRUNC('day', users.created_at) AS date,
          COALESCE(accounts.provider, 'email') AS provider,
          COUNT(users.id) AS count
        FROM
          users
        LEFT JOIN
          accounts ON accounts.user_id = users.id
        GROUP BY
          DATE_TRUNC('day', users.created_at),
          COALESCE(accounts.provider, 'email')
        ORDER BY
          DATE_TRUNC('day', users.created_at) DESC,
          COALESCE(accounts.provider, 'email') ASC;
      `

    const transformedResult: Stats = {}

    for (const { date, provider, count } of result) {
      const formattedDate = new Date(date).toISOString().split('T')[0]

      if (!(formattedDate in transformedResult)) {
        transformedResult[formattedDate] = {}
      }

      transformedResult[formattedDate][provider] = Number(count)
    }

    res.status(200)
    res.json({ success: true, data: transformedResult })
    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}

export default handler
