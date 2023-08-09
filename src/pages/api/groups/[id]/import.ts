import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { getServerSession } from 'next-auth/next'
import Papa from 'papaparse'
import { captureAPIError } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import { toTokens } from '@/lib/blockchain'
import { RecipientDTO } from '@/lib/dto/RecipientDTO'
import {
  GROUP_DOES_NOT_EXIST,
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
} from '@/lib/messages'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/lib/types/api'
import { CreateRecipientSchema } from '@/validations'
import type { NextApiRequest, NextApiResponse, PageConfig } from 'next'

export type ImportRecipientsApiResponse = ApiResponse<RecipientDTO[]>

interface NextApiRequestExtended extends NextApiRequest {
  file: Express.Multer.File
}

interface CsvRecipient {
  display_name: string
  comment: string
  wallet_address: string
  contacts: string
  salary: string
}

const storage = multer.diskStorage({
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  },
})

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedImageTypes = ['text/csv', 'application/csv']
    const isValidType = allowedImageTypes.includes(file.mimetype)

    if (isValidType) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  },
})

const parseSalary = (salary: string): number => {
  const parsedSalary = parseFloat(salary)
  return isNaN(parsedSalary) || parsedSalary < 0 ? 0 : parsedSalary
}

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
  res: NextApiResponse<ImportRecipientsApiResponse>
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

  const middleware = upload.single('csv')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middleware(req as any, res as any, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(422).json({
        success: false,
        message: err.message,
      })
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      })
    }

    const { file } = req as NextApiRequestExtended

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'File has not been attached',
      })
    }

    const fileContent = fs.readFileSync(file.path, 'utf-8')
    const parsedData = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    }).data as CsvRecipient[]

    fs.unlinkSync(file.path)

    const recipients = []

    for (const recipient of parsedData) {
      const validationResult = CreateRecipientSchema.safeParse({
        wallet_address: recipient.wallet_address,
        display_name: recipient.display_name || recipient.wallet_address,
        salary: toTokens(parseSalary(recipient.salary)),
        contacts: recipient.contacts ?? '',
        comment: recipient.comment ?? '',
      })

      if (!validationResult.success) {
        continue
      }

      const createdRecipient = prisma.recipient.create({
        data: {
          groupId: groupId,
          displayName: validationResult.data.display_name,
          comment: validationResult.data.comment,
          walletAddress: validationResult.data.wallet_address,
          contacts: validationResult.data.contacts,
          salary: validationResult.data.salary,
        },
      })

      recipients.push(createdRecipient)
    }

    const createdRecipients = await prisma.$transaction(recipients)

    const data = createdRecipients.map((recipient) =>
      RecipientDTO.fromModel(recipient)
    )

    return res.status(201).json({
      success: true,
      data: data,
    })
  })
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

export default handler
