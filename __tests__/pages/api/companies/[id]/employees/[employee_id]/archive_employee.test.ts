import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/companies/[id]/employees/[employee_id]'
import {
  cleanDatabase,
  mockDELETERequest,
  parseJSON,
} from '../../../../../../helpers'
import type { Employee } from '@prisma/client'

const ENDPOINT = '/api/employees/[id]'

describe(`DELETE ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('when company id is not a valid UUID', () => {
    it('returns error', async () => {
      const { req, res } = mockDELETERequest({ id: 'qwe' })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(parseJSON(res)).toEqual({
        success: false,
        message: `Invalid UUID`,
      })
    })
  })

  describe('when the company does not exist', () => {
    it('returns error', async () => {
      const companyId = uuidv4()

      const { req, res } = mockDELETERequest({ id: companyId })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(404)
      expect(parseJSON(res)).toEqual({
        success: false,
        message: `Company ${companyId} does not exist`,
      })
    })
  })
  describe('when company exists', () => {
    describe('when the employee id is not a valid UUID', () => {
      it('returns error', async () => {
        const company = await prisma.company.create({
          data: {
            display_name: 'Test Company',
            comment: 'This is a test company',
          },
        })

        const { req, res } = mockDELETERequest({
          id: company.id,
          employee_id: 'invalid-employee-id',
        })

        await handler(req, res)

        expect(res._getStatusCode()).toBe(500)
        expect(parseJSON(res)).toEqual({
          success: false,
          message: 'Invalid UUID',
        })
      })
    })

    describe('when the employee does not exist', () => {
      it('returns error', async () => {
        const company = await prisma.company.create({
          data: {
            display_name: 'Test Company',
            comment: 'This is a test company',
          },
        })

        const employee_id = uuidv4()

        const { req, res } = mockDELETERequest({
          id: company.id,
          employee_id,
        })

        await handler(req, res)

        expect(res._getStatusCode()).toBe(404)
        expect(parseJSON(res)).toEqual({
          success: false,
          message: `Employee ${employee_id} does not exist`,
        })
      })
    })
  })

  describe('when a valid employee is already archived', () => {
    it('returns HTTP 200 and the archived employee data', async () => {
      const company = await prisma.company.create({
        data: {
          display_name: 'Test Company',
          comment: 'This is a test company',
        },
      })

      const employee: Employee = await prisma.employee.create({
        data: {
          company_id: company.id,
          display_name: 'Test Employee',
          archived_at: new Date(),
        },
      })

      const { req, res } = mockDELETERequest({
        id: company.id,
        employee_id: employee.id,
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(parseJSON(res)).toEqual({
        success: true,
        data: {
          id: employee.id,
          display_name: 'Test Employee',
          comment: null,
          contacts: null,
          wallet_address: null,
          salary: 0,
          company_id: company.id,
          created_at: employee.created_at.toISOString(),
          updated_at: employee.updated_at.toISOString(),
          archived_at: employee.archived_at?.toISOString(),
        },
      })
    })
  })

  describe('when a valid employee is successfully archived', () => {
    it('returns HTTP 200 and the archived employee data', async () => {
      const company = await prisma.company.create({
        data: {
          display_name: 'Test Company',
          comment: 'This is a test company',
        },
      })

      const employee: Employee = await prisma.employee.create({
        data: {
          company_id: company.id,
          display_name: 'Test Employee',
        },
      })

      const { req, res } = mockDELETERequest({
        id: company.id,
        employee_id: employee.id,
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(parseJSON(res)).toEqual({
        success: true,
        data: {
          id: employee.id,
          display_name: 'Test Employee',
          comment: null,
          contacts: null,
          wallet_address: null,
          salary: 0,
          company_id: company.id,
          created_at: employee.created_at.toISOString(),
          updated_at: expect.any(String),
          archived_at: expect.any(String),
        },
      })
    })
  })
})
