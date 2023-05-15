import { captureAPIError } from '@/lib/api'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { createPayment } from '@/useCases/createPayment'
import type { Payment } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export type PaymentCreateApiResponse = ApiResponse<Payment>

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
  res: NextApiResponse<PaymentCreateApiResponse>
) => {
  try {
    const useCase = await createPayment(
      req.query.id as string,
      req.query.employee_id as string,
      req.body
    )

    res.status(useCase.status)

    if (useCase.success) {
      res.json({ success: true, data: useCase.data })
    } else {
      res.json({
        success: false,
        message: useCase.message,
        validation_errors: useCase.validationErrors,
      })
    }

    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}

export default handler
