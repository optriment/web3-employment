import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/companies/[id]/employees/[employee_id]/unarchive'
import {
  cleanDatabase,
  mockPOSTRequestWithQuery,
  parseJSON,
} from '../../../../../../helpers'
import type { Company, Employee } from '@prisma/client'

const ENDPOINT = '/api/companies/[id]/employees/[employee_id]/unarchive'

describe(`POST ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('when company id is not a valid UUID', () => {
    it('returns error', async () => {
      const { req, res } = mockPOSTRequestWithQuery({ id: 'qwe' })

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

      const { req, res } = mockPOSTRequestWithQuery({ id: companyId })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(404)
      expect(parseJSON(res)).toEqual({
        success: false,
        message: `Company ${companyId} does not exist`,
      })
    })
  })

  describe('when company exists', () => {
    let company: Company

    beforeEach(async () => {
      company = await prisma.company.create({
        data: {
          display_name: 'Springfield Nuclear Power Plant',
        },
      })
    })

    describe('when the employee id is not a valid UUID', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery({
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
        const employee_id = uuidv4()

        const { req, res } = mockPOSTRequestWithQuery({
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

    describe('when a valid employee is already unarchived', () => {
      it('returns HTTP 200 and the unarchived employee data', async () => {
        const employee: Employee = await prisma.employee.create({
          data: {
            company_id: company.id,
            display_name: 'Test Employee',
          },
        })

        const { req, res } = mockPOSTRequestWithQuery({
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
            archived_at: null,
          },
        })
      })
    })

    describe('when a valid employee is successfully unarchived', () => {
      it('returns HTTP 200 and the unarchived employee data', async () => {
        const employee: Employee = await prisma.employee.create({
          data: {
            company_id: company.id,
            display_name: 'Test Employee',
            archived_at: new Date(),
          },
        })

        const { req, res } = mockPOSTRequestWithQuery({
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
            archived_at: null,
          },
        })
      })
    })
  })
})
