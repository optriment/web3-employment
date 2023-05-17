import { captureAPIError } from '@/lib/api'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { unarchiveRecipient } from '@/useCases/unarchiveRecipient'
import type { NextApiRequest, NextApiResponse } from 'next'

export type RecipientUnarchiveApiResponse = ApiResponse<RecipientDTO>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      return await handlePOST(req, res)

    default:
      res.status(405)
      res.json({ success: false, ...METHOD_NOT_ALLOWED })
      return res.end()
  }
}

const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse<RecipientUnarchiveApiResponse>
) => {
  try {
    const recipient = await unarchiveRecipient(
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
