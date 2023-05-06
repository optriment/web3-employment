import { prisma } from '@/lib/prisma'

interface ArchiveCompanyResponse {
  success: boolean
  message?: string
}

export const archiveCompany = async (
  companyId: string
): Promise<ArchiveCompanyResponse> => {
  const existingCompany = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
  })
  if (!existingCompany) {
    return {
      success: false,
      message: 'Company not found',
    }
  }

  if (existingCompany.archived_at !== null) {
    return {
      success: true,
      message: 'Company already archived',
    }
  }

  // Archive the company
  await prisma.company.update({
    where: {
      id: companyId,
    },
    data: {
      archived_at: new Date(),
    },
  })

  return {
    success: true,
    message: 'Company archived successfully',
  }
}
