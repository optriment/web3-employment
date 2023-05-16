import { captureAPIError } from '@/lib/api'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { createRecipient } from '@/useCases/createRecipient'
import type { NextApiRequest, NextApiResponse } from 'next'

export type RecipientCreateApiResponse = ApiResponse<RecipientDTO>

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
  res: NextApiResponse<RecipientCreateApiResponse>
) => {
  try {
    const recipient = await createRecipient(req.query.id as string, req.body)

    res.status(201)
    res.json({ success: true, data: recipient })
    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}

export default handler
