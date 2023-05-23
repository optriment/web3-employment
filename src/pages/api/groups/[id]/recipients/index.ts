import { getServerSession } from 'next-auth/next'
import { captureAPIError } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { createRecipient } from '@/useCases/createRecipient'
import type { NextApiRequest, NextApiResponse } from 'next'

export type RecipientCreateApiResponse = ApiResponse<RecipientDTO>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.userId) {
      res.status(401)
      res.json({ success: false, ...UNAUTHORIZED })
      return res.end()
    }

    switch (req.method) {
      case 'POST':
        return await handlePOST(session.userId, req, res)

      default:
        res.status(405)
        res.json({ success: false, ...METHOD_NOT_ALLOWED })
        return res.end()
    }
  } catch (e) {
    return captureAPIError(e, res)
  }
}

const handlePOST = async (
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<RecipientCreateApiResponse>
) => {
  const recipient = await createRecipient(
    userId,
    req.query.id as string,
    req.body
  )

  res.status(201)
  res.json({ success: true, data: recipient })
  return res.end()
}

export default handler
