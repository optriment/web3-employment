import { getServerSession } from 'next-auth/next'
import { captureAPIError } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import type { GroupDTO } from '@/lib/dto/GroupDTO'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/lib/messages'
import type { ApiResponse } from '@/lib/types/api'
import { archiveGroup } from '@/useCases/archiveGroup'
import { getGroupWithRecipients } from '@/useCases/getGroupWithRecipients'
import { updateGroup } from '@/useCases/updateGroup'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface GroupWithRecipients {
  group: GroupDTO
  recipients: RecipientDTO[]
}

export type GroupWithRecipientsApiResponse = ApiResponse<GroupWithRecipients>

export type GroupUpdateApiResponse = ApiResponse<GroupDTO>

export type GroupArchiveApiResponse = ApiResponse<GroupDTO>

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

      case 'PUT':
        return await handlePUT(session.userId, req, res)

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
  req: NextApiRequest,
  res: NextApiResponse<GroupWithRecipientsApiResponse>
) => {
  const groupWithRecipients = await getGroupWithRecipients(
    userId,
    req.query.id as string
  )

  res.status(200)
  res.json({ success: true, data: groupWithRecipients })
  return res.end()
}

const handlePUT = async (
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<GroupUpdateApiResponse>
) => {
  const group = await updateGroup(userId, req.query.id as string, req.body)

  res.status(200)
  res.json({ success: true, data: group })
  return res.end()
}

const handleDELETE = async (
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse<GroupArchiveApiResponse>
) => {
  const group = await archiveGroup(userId, req.query.id as string)

  res.status(200)
  res.json({ success: true, data: group })
  return res.end()
}

export default handler
