import { captureAPIError } from '@/lib/api'
import type { GroupDTO } from '@/lib/dto/GroupDTO'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { unarchiveGroup } from '@/useCases/unarchiveGroup'
import type { NextApiRequest, NextApiResponse } from 'next'

export type GroupUnarchiveApiResponse = ApiResponse<GroupDTO>

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
  res: NextApiResponse<GroupUnarchiveApiResponse>
) => {
  try {
    const group = await unarchiveGroup(req.query.id as string)

    res.status(200)
    res.json({ success: true, data: group })
    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}

export default handler
