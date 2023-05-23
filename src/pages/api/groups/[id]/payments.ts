import { getServerSession } from 'next-auth/next'
import { captureAPIError } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import type { GroupDTO } from '@/lib/dto/GroupDTO'
import type { PaymentDTO } from '@/lib/dto/PaymentDTO'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { getGroupPayments } from '@/useCases/getGroupPayments'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface GroupPayments {
  group: GroupDTO
  payments: PaymentDTO[]
  recipients: RecipientDTO[]
}

export type GroupPaymentsApiResponse = ApiResponse<GroupPayments>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.userId) {
      res.status(401)
      res.json({ success: false, ...UNAUTHORIZED })
      return res.end()
    }

    switch (req.method) {
      case 'GET':
        return await handleGET(session.userId, req, res)

      default:
        res.status(405)
        res.json({ success: false, ...METHOD_NOT_ALLOWED })
        return res.end()
    }
  } catch (e) {
    return captureAPIError(e, res)
  }
}

const handleGET = async (
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<GroupPaymentsApiResponse>
) => {
  const groupPayments = await getGroupPayments(userId, req.query.id as string)

  res.status(200)
  res.json({ success: true, data: groupPayments })
  return res.end()
}

export default handler
