import { captureAPIError } from '@/lib/api'
import type { GroupDTO } from '@/lib/dto/GroupDTO'
import type { PaymentDTO } from '@/lib/dto/PaymentDTO'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
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
  switch (req.method) {
    case 'GET':
      return await handleGET(req, res)

    default:
      res.status(405)
      res.json({ success: false, ...METHOD_NOT_ALLOWED })
      return res.end()
  }
}

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse<GroupPaymentsApiResponse>
) => {
  try {
    const groupPayments = await getGroupPayments(req.query.id as string)

    res.status(200)
    res.json({ success: true, data: groupPayments })
    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}

export default handler
