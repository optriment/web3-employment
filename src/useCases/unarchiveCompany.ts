import { prisma } from '@/lib/prisma'
import type { Company } from '@prisma/client'

interface UnarchiveCompanyResult {
  status: number
  success: boolean
  message?: string
  data?: Company
}

export const unarchiveCompany = async (
  id: string
): Promise<UnarchiveCompanyResult> => {
  const company = await prisma.company.findUnique({
    where: {
      id: id,
    },
  })

  if (!company) {
    return {
      status: 404,
      success: false,
      message: `Company ${id} does not exist`,
    }
  }

  if (company.archived_at === null) {
    return {
      status: 200,
      success: true,
      data: company,
    }
  }

  const unarchivedCompany = await prisma.company.update({
    where: {
      id: id,
    },
    data: {
      archived_at: null,
    },
  })

  return {
    status: 200,
    success: true,
    data: unarchivedCompany,
  }
}
