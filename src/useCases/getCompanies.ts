import { prisma } from '@/lib/prisma'
import type { Company } from '@prisma/client'

interface GetCompaniesResult {
  status: number
  success: boolean
  data?: Company[]
  message?: string
}

export const getCompanies = async (): Promise<GetCompaniesResult> => {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        display_name: true,
        comment: true,
        created_at: true,
        updated_at: true,
        archived_at: true,
      },
    })
    return {
      status: 200,
      success: true,
      data: companies,
    }
  } catch (error) {
    return {
      status: 500,
      success: false,
      data: undefined,
      message: 'Unhandled error',
    }
  }
}
