import { prisma } from '@/lib/prisma'
import type { Company, Employee } from '@prisma/client'

interface CompanyWithEmployees {
  company: Company
  employees: Employee[]
}

interface CompanyWithEmployeesResult {
  status: number
  success: boolean
  data?: CompanyWithEmployees
  message?: string
}

export const getCompanyWithEmployees = async (
  id: string
): Promise<CompanyWithEmployeesResult> => {
  const company = await prisma.company.findFirst({
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

  const employees = await prisma.employee.findMany({
    where: {
      company_id: id,
    },
  })

  return {
    status: 200,
    success: true,
    data: {
      company,
      employees,
    },
  }
}
