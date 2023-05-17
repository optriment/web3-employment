import { captureAPIError } from '@/lib/api'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { archiveRecipient } from '@/useCases/archiveRecipient'
import { updateRecipient } from '@/useCases/updateRecipient'
import type { NextApiRequest, NextApiResponse } from 'next'

export type RecipientUpdateApiResponse = ApiResponse<RecipientDTO>

export type RecipientArchiveApiResponse = ApiResponse<RecipientDTO>

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
  res: NextApiResponse<RecipientUpdateApiResponse>
) => {
  try {
    const recipient = await updateRecipient(
      req.query.id as string,
      req.query.recipient_id as string,
      req.body
    )

    res.status(200)
    res.json({ success: true, data: recipient })
    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}

const handleDELETE = async (
  req: NextApiRequest,
  res: NextApiResponse<RecipientArchiveApiResponse>
) => {
  try {
    const recipient = await archiveRecipient(
      req.query.id as string,
      req.query.recipient_id as string
    )

    res.status(200)
    res.json({ success: true, data: recipient })
    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}

export default handler
