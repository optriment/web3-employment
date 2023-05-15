import { captureAPIError } from '@/lib/api'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { createCompany } from '@/useCases/createCompany'
import { getCompanies } from '@/useCases/getCompanies'
import type { Company } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export type CompanyCreateApiResponse = ApiResponse<Company>
export type CompanyGetApiResponse = ApiResponse<Company[]>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      return await handlePOST(req, res)

    case 'GET':
      return await handleGET(req, res)

    default:
      res.status(405)
      res.json({ success: false, ...METHOD_NOT_ALLOWED })
      return res.end()
  }
}

const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse<CompanyCreateApiResponse>
) => {
  try {
    const useCase = await createCompany(req.body)
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

const handleGET = async (
  _req: NextApiRequest,
  res: NextApiResponse<CompanyGetApiResponse>
) => {
  try {
    const useCase = await getCompanies()

    res.status(useCase.status)
    if (useCase.success) {
      res.json({ success: true, data: useCase.data })
    } else {
      res.json({ success: false, message: useCase.message })
    }
  } catch (e) {
    return captureAPIError(e, res)
  }
}
export default handler
