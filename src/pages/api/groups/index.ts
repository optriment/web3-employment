import { getServerSession } from 'next-auth/next'
import { captureAPIError } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import type { GroupDTO } from '@/lib/dto/GroupDTO'
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { createGroup } from '@/useCases/createGroup'
import { getGroups } from '@/useCases/getGroups'
import type { NextApiRequest, NextApiResponse } from 'next'

export type GroupCreateApiResponse = ApiResponse<GroupDTO>
export type GroupGetApiResponse = ApiResponse<GroupDTO[]>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.userId) {
      res.status(401)
      res.json({ success: false, ...UNAUTHORIZED })
      return res.end()
    }

    switch (req.method) {
      case 'POST':
        return await handlePOST(session.userId, req, res)

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

const handlePOST = async (
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<GroupCreateApiResponse>
) => {
  const group = await createGroup(userId, req.body)

  res.status(201)
  res.json({ success: true, data: group })
  return res.end()
}

const handleGET = async (
  userId: string,
  _req: NextApiRequest,
  res: NextApiResponse<GroupGetApiResponse>
) => {
  const groups = await getGroups(userId)

  res.status(200)
  res.json({ success: true, data: groups })
  return res.end()
}

export default handler
