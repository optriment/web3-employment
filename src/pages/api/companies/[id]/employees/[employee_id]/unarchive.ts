import { captureAPIError } from '@/lib/api'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { unarchiveEmployee } from '@/useCases/unarchiveEmployee'
import type { Employee } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export type EmployeeUnarchiveApiResponse = ApiResponse<Employee>

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
  res: NextApiResponse<EmployeeUnarchiveApiResponse>
) => {
  try {
    const useCase = await unarchiveEmployee(
      req.query.id as string,
      req.query.employee_id as string
    )

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
