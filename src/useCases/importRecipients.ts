import { ClientError } from '@/lib/clientError'
import { RecipientDTO } from '@/lib/dto/RecipientDTO'
import { GROUP_DOES_NOT_EXIST } from '@/lib/messages'
import { prisma } from '@/lib/prisma'
import { parseCsvFile } from '@/utils/parse-csv-file'
import { CreateRecipientSchema } from '@/validations'

interface CsvRecipient {
  display_name: string
  comment: string
  wallet_address: string
  contacts: string
  salary: string
}

const parseSalary = (salary: string): number => {
  const parsedSalary = parseInt(salary)
  return isNaN(parsedSalary) || parsedSalary < 0 ? 0 : parsedSalary
}

export const importRecipients = async (
  userId: string,
  groupId: string,
  file: File
): Promise<RecipientDTO[]> => {
  const group = await prisma.group.findFirst({
    where: {
      userId: userId,
      id: groupId,
    },
  })

  if (!group) {
    throw new ClientError(GROUP_DOES_NOT_EXIST.message, 404)
  }

  const csvRecipients = await parseCsvFile<CsvRecipient>(file)

  const recipients = []

  for (const recipient of csvRecipients) {
    if (!recipient.wallet_address) continue

    const validationResult = CreateRecipientSchema.safeParse({
      ...recipient,
      display_name: recipient.display_name || recipient.wallet_address,
      salary: parseSalary(recipient.salary),
    })

    if (validationResult.success) {
      const recipient = prisma.recipient.create({
        data: {
          groupId: groupId,
          displayName: validationResult.data.display_name,
          comment: validationResult.data.comment,
          walletAddress: validationResult.data.wallet_address,
          contacts: validationResult.data.contacts,
          salary: validationResult.data.salary,
        },
      })

      recipients.push(recipient)
    }
  }

  const createdRecipients = await prisma.$transaction(recipients)

  return createdRecipients.map((recipient) => RecipientDTO.fromModel(recipient))
}
