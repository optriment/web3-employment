import { captureAPIError } from '@/lib/api'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { getCompanyPayments } from '@/useCases/getCompanyPayments'
import type { Company, Employee, Payment } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface CompanyPayments {
  company: Company
  payments: Payment[]
  employees: Employee[]
}

export type CompanyPaymentsApiResponse = ApiResponse<CompanyPayments>

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
  res: NextApiResponse<CompanyPaymentsApiResponse>
) => {
  try {
    const useCase = await getCompanyPayments(req.query.id as string)

    res.status(useCase.status)

    if (useCase.success) {
      res.json({ success: true, data: useCase.data })
    } else {
      res.json({
        success: false,
        message: useCase.message,
      })
    }

    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}

export default handler
