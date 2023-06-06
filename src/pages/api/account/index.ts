import { getServerSession } from 'next-auth/next'
import { captureAPIError } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import type { UserDTO } from '@/lib/dto/UserDTO'
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { deleteUserAccount } from '@/useCases/deleteUserAccount'
import { getUserAccount } from '@/useCases/getUserAccount'
import type { NextApiRequest, NextApiResponse } from 'next'

export type GetUserAccountApiResponse = ApiResponse<UserDTO>
export type DeleteUserAccountApiResponse = ApiResponse<UserDTO>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.userId) {
      res.status(401)
      res.json({ success: false, ...UNAUTHORIZED })
      return res.end()
    }

    switch (req.method) {
      case 'GET':
        return await handleGET(session.userId, req, res)

      case 'DELETE':
        return await handleDELETE(session.userId, req, res)

      default:
        res.status(405)
        res.json({ success: false, ...METHOD_NOT_ALLOWED })
        return res.end()
    }
  } catch (e) {
    return captureAPIError(e, res)
  }
}

const handleGET = async (
  userId: string,
  _req: NextApiRequest,
  res: NextApiResponse<GetUserAccountApiResponse>
) => {
  const account = await getUserAccount(userId)

  res.status(200)
  res.json({ success: true, data: account })
  return res.end()
}

const handleDELETE = async (
  userId: string,
  _req: NextApiRequest,
  res: NextApiResponse<DeleteUserAccountApiResponse>
) => {
  const account = await deleteUserAccount(userId)

  res.status(200)
  res.json({ success: true, data: account })
  return res.end()
}

export default handler
