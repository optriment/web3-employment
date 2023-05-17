import { captureAPIError } from '@/lib/api'
import type { GroupDTO } from '@/lib/dto/GroupDTO'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { createGroup } from '@/useCases/createGroup'
import { getGroups } from '@/useCases/getGroups'
import type { NextApiRequest, NextApiResponse } from 'next'

export type GroupCreateApiResponse = ApiResponse<GroupDTO>
export type GroupGetApiResponse = ApiResponse<GroupDTO[]>

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
  res: NextApiResponse<GroupCreateApiResponse>
) => {
  try {
    const group = await createGroup(req.body)

    res.status(201)
    res.json({ success: true, data: group })
    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}

const handleGET = async (
  _req: NextApiRequest,
  res: NextApiResponse<GroupGetApiResponse>
) => {
  try {
    const groups = await getGroups()

    res.status(200)
    res.json({ success: true, data: groups })
    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}
export default handler
