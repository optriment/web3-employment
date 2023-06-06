import { getServerSession } from 'next-auth/next'
import { captureAPIError } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import type { UserDTO } from '@/lib/dto/UserDTO'
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { getUserProfile } from '@/useCases/getUserProfile'
import type { NextApiRequest, NextApiResponse } from 'next'

export type GetUserProfileApiResponse = ApiResponse<UserDTO>

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
  res: NextApiResponse<GetUserProfileApiResponse>
) => {
  const profile = await getUserProfile(userId)

  res.status(200)
  res.json({ success: true, data: profile })
  return res.end()
}

export default handler
