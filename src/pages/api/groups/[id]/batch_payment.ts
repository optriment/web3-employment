import { getServerSession } from 'next-auth/next'
import { captureAPIError } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import type { BatchPaymentDTO } from '@/lib/dto/BatchPaymentDTO'
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { createBatchPayment } from '@/useCases/createBatchPayment'
import type { NextApiRequest, NextApiResponse } from 'next'

export type BatchPaymentCreateApiResponse = ApiResponse<BatchPaymentDTO>

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
  res: NextApiResponse<BatchPaymentCreateApiResponse>
) => {
  const batchPayment = await createBatchPayment(userId, req.body)

  res.status(201)
  res.json({ success: true, data: batchPayment })
  return res.end()
}

export default handler
