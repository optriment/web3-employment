import { parse } from 'json2csv'
import { getServerSession } from 'next-auth/next'
import { captureAPIError } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import { fromTokens } from '@/lib/blockchain'
import {
  GROUP_DOES_NOT_EXIST,
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
} from '@/lib/messages'
import { prisma } from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

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
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const groupId = req.query.id as string

  const group = await prisma.group.findFirst({
    where: {
      userId: userId,
      id: groupId,
    },
  })

  if (!group) {
    return res.status(404).json({
      success: false,
      ...GROUP_DOES_NOT_EXIST,
    })
  }

  const recipients = await prisma.recipient.findMany({
    where: {
      groupId: groupId,
    },
  })

  const dtos = recipients.map((recipient) => ({
    display_name: recipient.displayName,
    comment: recipient.comment,
    wallet_address: recipient.walletAddress,
    salary: recipient.salary
      ? fromTokens(Number(recipient.salary)).toString()
      : 0,
    contacts: recipient.contacts,
  }))

  const fields = [
    'display_name',
    'comment',
    'wallet_address',
    'salary',
    'contacts',
  ]

  const csv = parse(dtos, { fields })

  res.setHeader('Content-Disposition', 'attachment; filename=recipients.csv')
  res.setHeader('Content-Type', 'text/csv')
  res.status(200).send(csv)
}

export default handler
