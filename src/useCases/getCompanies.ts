import { prisma } from '@/lib/prisma'
import type { Company } from '@prisma/client'

interface GetCompaniesResult {
  status: number
  success: boolean
  data?: Company[]
  message?: string
}

export const getCompanies = async (): Promise<GetCompaniesResult> => {
  const companies = await prisma.company.findMany()

  return {
    status: 200,
    success: true,
    data: companies,
  }
}
