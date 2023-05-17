import { captureAPIError } from '@/lib/api'
import type { GroupDTO } from '@/lib/dto/GroupDTO'
import type { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
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
  switch (req.method) {
    case 'GET':
      return await handleGET(req, res)

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

const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse<GroupWithRecipientsApiResponse>
) => {
  try {
    const groupWithRecipients = await getGroupWithRecipients(
      req.query.id as string
    )

    res.status(200)
    res.json({ success: true, data: groupWithRecipients })
    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}

const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse<GroupUpdateApiResponse>
) => {
  try {
    const group = await updateGroup(req.query.id as string, req.body)

    res.status(200)
    res.json({ success: true, data: group })
    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}

const handleDELETE = async (
  req: NextApiRequest,
  res: NextApiResponse<GroupArchiveApiResponse>
) => {
  try {
    const group = await archiveGroup(req.query.id as string)

    res.status(200)
    res.json({ success: true, data: group })
    return res.end()
  } catch (e) {
    return captureAPIError(e, res)
  }
}

export default handler
