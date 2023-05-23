import { getServerSession } from 'next-auth/next'
import { captureAPIError } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { archiveRecipient } from '@/useCases/archiveRecipient'
import { updateRecipient } from '@/useCases/updateRecipient'
import type { NextApiRequest, NextApiResponse } from 'next'

export type RecipientUpdateApiResponse = ApiResponse<RecipientDTO>

export type RecipientArchiveApiResponse = ApiResponse<RecipientDTO>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.userId) {
      res.status(401)
      res.json({ success: false, ...UNAUTHORIZED })
      return res.end()
    }

    switch (req.method) {
      case 'PUT':
        return await handlePUT(session.userId, req, res)

      case 'DELETE':
        return await handleDELETE(session.userId, req, res)

      default:
        res.status(405)
        res.json({ success: false, ...METHOD_NOT_ALLOWED })
        return res.end()
    }
  } catch (e) {
    return captureAPIError(e, res)
  }
}

const handlePUT = async (
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<RecipientUpdateApiResponse>
) => {
  const recipient = await updateRecipient(
    userId,
    req.query.id as string,
    req.query.recipient_id as string,
    req.body
  )

  res.status(200)
  res.json({ success: true, data: recipient })
  return res.end()
}

const handleDELETE = async (
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<RecipientArchiveApiResponse>
) => {
  const recipient = await archiveRecipient(
    userId,
    req.query.id as string,
    req.query.recipient_id as string
  )

  res.status(200)
  res.json({ success: true, data: recipient })
  return res.end()
}

export default handler
