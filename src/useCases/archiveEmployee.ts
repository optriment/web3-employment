import { prisma } from '@/lib/prisma'
import type { Employee } from '@prisma/client'

interface ArchiveEmployeeResult {
  status: number
  success: boolean
  message?: string
  data?: Employee
}

export const archiveEmployee = async (
  companyId: string,
  employeeId: string
): Promise<ArchiveEmployeeResult> => {
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
    },
  })

  if (!company) {
    return {
      status: 404,
      success: false,
      message: `Company ${companyId} does not exist`,
    }
  }

  const employee = await prisma.employee.findFirst({
    where: {
      company_id: companyId,
      id: employeeId,
    },
  })

  if (!employee) {
    return {
      status: 404,
      success: false,
      message: `Employee ${employeeId} does not exist`,
    }
  }

  if (employee.archived_at !== null) {
    return {
      status: 200,
      success: true,
      data: employee,
    }
  }

  const archivedEmployee = await prisma.employee.update({
    where: {
      id: employeeId,
    },
    data: {
      archived_at: new Date(),
    },
  })

  return {
    status: 200,
    success: true,
    data: archivedEmployee,
  }
}
