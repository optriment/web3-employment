import { prisma } from '@/lib/prisma'
import type { Company } from '@prisma/client'

interface ArchiveCompanyResponse {
  status: number
  success: boolean
  message?: string
  data?: Company
}

export const archiveCompany = async (
  id: string
): Promise<ArchiveCompanyResponse> => {
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

  if (company.archived_at !== null) {
    return {
      status: 200,
      success: true,
      data: company,
    }
  }

  const archivedCompany = await prisma.company.update({
    where: {
      id: id,
    },
    data: {
      archived_at: new Date(),
    },
  })

  return {
    status: 200,
    success: true,
    data: archivedCompany,
  }
}
