import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/companies/[id]/employees/[employee_id]/payment'
import {
  cleanDatabase,
  mockPOSTRequestWithQuery,
  parseJSON,
} from '../../../../../../helpers'
import type { Company, Employee } from '@prisma/client'

const ENDPOINT = '/api/companies/[id]/employees/[employee_id]/payment'

beforeEach(async () => {
  await cleanDatabase(prisma)
})

describe(`POST ${ENDPOINT}`, () => {
  describe('general errors', () => {
    describe('when company id is not a valid UUID', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery({ id: 'qwe' }, {})

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

        const { req, res } = mockPOSTRequestWithQuery({ id: companyId }, {})

        await handler(req, res)

        expect(res._getStatusCode()).toBe(404)
        expect(parseJSON(res)).toEqual({
          success: false,
          message: `Company ${companyId} does not exist`,
        })
      })
    })

    describe('when company exists', () => {
      describe('when company is archived', () => {
        it('returns error', async () => {
          const company = await prisma.company.create({
            data: {
              display_name: 'Springfield Nuclear Power Plant',
              archived_at: new Date(),
            },
          })

          const { req, res } = mockPOSTRequestWithQuery(
            { id: company.id, employee_id: 'qwe' },
            {}
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(400)
          expect(parseJSON(res)).toEqual({
            success: false,
            message: `Company ${company.id} is archived`,
          })
        })
      })

      describe('when company is active', () => {
        let company: Company

        beforeEach(async () => {
          company = await prisma.company.create({
            data: {
              display_name: 'Springfield Nuclear Power Plant',
            },
          })
        })

        describe('when employee id is not a valid UUID', () => {
          it('returns error', async () => {
            const { req, res } = mockPOSTRequestWithQuery(
              { id: company.id, employee_id: 'qwe' },
              {}
            )

            await handler(req, res)

            expect(res._getStatusCode()).toBe(500)
            expect(parseJSON(res)).toEqual({
              success: false,
              message: `Invalid UUID`,
            })
          })
        })

        describe('when the employee does not exist', () => {
          it('returns error', async () => {
            const employeeId = uuidv4()

            const { req, res } = mockPOSTRequestWithQuery(
              { id: company.id, employee_id: employeeId },
              {}
            )

            await handler(req, res)

            expect(res._getStatusCode()).toBe(404)
            expect(parseJSON(res)).toEqual({
              success: false,
              message: `Employee ${employeeId} does not exist`,
            })
          })
        })

        describe('when employee does not have wallet', () => {
          it('returns error', async () => {
            const employee = await prisma.employee.create({
              data: {
                company_id: company.id,
                display_name: 'Homer Jay Simpson',
              },
            })

            const { req, res } = mockPOSTRequestWithQuery(
              { id: company.id, employee_id: employee.id },
              {}
            )

            await handler(req, res)

            expect(res._getStatusCode()).toBe(400)
            expect(parseJSON(res)).toEqual({
              success: false,
              message: `Employee ${employee.id} doesn't have wallet`,
            })
          })
        })

        describe('when employee is archived', () => {
          it('returns error', async () => {
            const employee = await prisma.employee.create({
              data: {
                company_id: company.id,
                display_name: 'Homer Jay Simpson',
                wallet_address: '0xDEADBEEF',
                archived_at: new Date(),
              },
            })

            const { req, res } = mockPOSTRequestWithQuery(
              { id: company.id, employee_id: employee.id },
              {}
            )

            await handler(req, res)

            expect(res._getStatusCode()).toBe(400)
            expect(parseJSON(res)).toEqual({
              success: false,
              message: `Employee ${employee.id} is archived`,
            })
          })
        })
      })
    })
  })

  describe('validation errors', () => {
    let company: Company, employee: Employee

    beforeEach(async () => {
      company = await prisma.company.create({
        data: {
          display_name: 'Springfield Nuclear Power Plant',
        },
      })

      employee = await prisma.employee.create({
        data: {
          company_id: company.id,
          display_name: 'Homer Jay Simpson',
          wallet_address: '0xDEADBEEF',
        },
      })
    })

    describe('when required fields are missing', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          { id: company.id, employee_id: employee.id },
          {}
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        const result = parseJSON(res)

        expect(result.success).toBeFalse()
        expect(result.validation_errors).toHaveLength(2)
        expect(result.validation_errors).toIncludeAllMembers([
          'Transaction hash: Required',
          'Amount: Required',
        ])
      })
    })

    describe('when transaction_hash is not a string', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          { id: company.id, employee_id: employee.id },
          { transaction_hash: 1, amount: 1 }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        expect(parseJSON(res)).toEqual({
          success: false,
          validation_errors: [
            'Transaction hash: Expected string, received number',
          ],
        })
      })
    })

    describe('when transaction_hash is an empty string', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          { id: company.id, employee_id: employee.id },
          { transaction_hash: ' ', amount: 1 }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        expect(parseJSON(res)).toEqual({
          success: false,
          validation_errors: [
            'Transaction hash: String must contain at least 2 character(s)',
          ],
        })
      })
    })

    describe('when transaction_hash is too short', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          { id: company.id, employee_id: employee.id },
          { transaction_hash: ' 1 ', amount: 1 }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        expect(parseJSON(res)).toEqual({
          success: false,
          validation_errors: [
            'Transaction hash: String must contain at least 2 character(s)',
          ],
        })
      })
    })

    describe('when amount is not a number', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          { id: company.id, employee_id: employee.id },
          { transaction_hash: '123', amount: '1' }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        expect(parseJSON(res)).toEqual({
          success: false,
          validation_errors: ['Amount: Expected number, received string'],
        })
      })
    })

    describe('when amount is a negative number', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          { id: company.id, employee_id: employee.id },
          { transaction_hash: '123', amount: -1 }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        expect(parseJSON(res)).toEqual({
          success: false,
          validation_errors: ['Amount: Number must be greater than 0'],
        })
      })
    })

    describe('when amount is zero', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          { id: company.id, employee_id: employee.id },
          { transaction_hash: '123', amount: 0 }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        expect(parseJSON(res)).toEqual({
          success: false,
          validation_errors: ['Amount: Number must be greater than 0'],
        })
      })
    })

    describe('when amount is a float number', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          { id: company.id, employee_id: employee.id },
          { transaction_hash: '123', amount: 0.01 }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        expect(parseJSON(res)).toEqual({
          success: false,
          validation_errors: ['Amount: Expected integer, received float'],
        })
      })
    })
  })

  describe('when everything is good', () => {
    let company: Company, employee: Employee

    beforeEach(async () => {
      company = await prisma.company.create({
        data: {
          display_name: 'Springfield Nuclear Power Plant',
        },
      })

      employee = await prisma.employee.create({
        data: {
          company_id: company.id,
          display_name: 'Homer Jay Simpson',
          wallet_address: '0xDEADBEEF',
        },
      })
    })

    it('returns valid response', async () => {
      const { req, res } = mockPOSTRequestWithQuery(
        { id: company.id, employee_id: employee.id },
        { transaction_hash: '123', amount: 42 }
      )

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)

      const response = parseJSON(res)
      expect(response.success).toBeTruthy()
      expect(response.data).not.toBeEmptyObject()
      expect(response.data.id).not.toBeEmpty()
      expect(response.data.employee_id).toEqual(employee.id)
      expect(response.data.wallet_address).toEqual('0xDEADBEEF')
      expect(response.data.transaction_hash).toEqual('123')
      expect(response.data.amount).toEqual(42)
      expect(response.data.created_at).not.toBeEmpty()
    })
  })
})
