import { prisma } from '@/lib/prisma'
import type { Company, Payment, Employee } from '@prisma/client'

interface CompanyPayments {
  company: Company
  payments: Payment[]
  employees: Employee[]
}

export interface CompanyPaymentsResult {
  status: number
  success: boolean
  data?: CompanyPayments
  message?: string
}

export const getCompanyPayments = async (
  id: string
): Promise<CompanyPaymentsResult> => {
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

  const payments = await prisma.payment.findMany({
    where: {
      employee_id: {
        in: employees.map((employee) => employee.id),
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  })

  return {
    status: 200,
    success: true,
    data: {
      company,
      payments,
      employees,
    },
  }
}
