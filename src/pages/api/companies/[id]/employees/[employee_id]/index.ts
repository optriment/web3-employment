import { captureAPIError } from '@/lib/api'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { archiveEmployee } from '@/useCases/archiveEmployee'
import { updateEmployee } from '@/useCases/updateEmployee'
import type { Employee } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export type EmployeeUpdateApiResponse = ApiResponse<Employee>

export type EmployeeArchiveApiResponse = ApiResponse<Employee>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'PUT':
      return await handlePUT(req, res)

    case 'DELETE':
      return await handleDELETE(req, res)

    default:
      res.status(405)
      res.json({ success: false, ...METHOD_NOT_ALLOWED })
      return res.end()
  }
}

const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse<EmployeeUpdateApiResponse>
) => {
  try {
    const useCase = await updateEmployee(
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

const handleDELETE = async (
  req: NextApiRequest,
  res: NextApiResponse<EmployeeArchiveApiResponse>
) => {
  try {
    const useCase = await archiveEmployee(
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
