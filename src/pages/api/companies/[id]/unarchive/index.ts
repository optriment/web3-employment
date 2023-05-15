import { captureAPIError } from '@/lib/api'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { unarchiveCompany } from '@/useCases/unarchiveCompany'
import type { Company } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export type CompanyUnarchiveApiResponse = ApiResponse<Company>

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
  res: NextApiResponse<CompanyUnarchiveApiResponse>
) => {
  try {
    const useCase = await unarchiveCompany(req.query.id as string)

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
