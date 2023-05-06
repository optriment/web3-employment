import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/companies/[id]/payments'
import {
  cleanDatabase,
  mockGETRequestWithQuery,
  parseJSON,
} from '../../../../helpers'
import type { Company, Employee, Payment } from '@prisma/client'

const ENDPOINT = '/api/companies/[id]/payments'

beforeEach(async () => {
  await cleanDatabase(prisma)
})

describe(`GET ${ENDPOINT}`, () => {
  describe('when company id is not a valid UUID', () => {
    it('returns error', async () => {
      const { req, res } = mockGETRequestWithQuery({ id: 'qwe' })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(parseJSON(res)).toEqual({
        success: false,
        message: `Invalid UUID`,
      })
    })
  })

  describe('when company does not exist', () => {
    it('returns error', async () => {
      const companyId = uuidv4()

      const { req, res } = mockGETRequestWithQuery({ id: companyId })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(404)
      expect(parseJSON(res)).toEqual({
        success: false,
        message: `Company ${companyId} does not exist`,
      })
    })
  })

  describe('when company exists', () => {
    let company: Company, anotherCompany: Company

    beforeEach(async () => {
      company = await prisma.company.create({
        data: {
          display_name: 'Company',
          comment: 'Comment',
        },
      })

      anotherCompany = await prisma.company.create({
        data: {
          display_name: 'Another Company',
        },
      })
    })

    describe('when there are no employees', () => {
      it('returns a specific company and empty employees and payments arrays', async () => {
        const { req, res } = mockGETRequestWithQuery({ id: company.id })

        await handler(req, res)

        expect(res._getStatusCode()).toBe(200)

        const result = parseJSON(res)

        expect(result.success).toBeTrue()

        expect(result.data.company.id).toEqual(company.id)
        expect(result.data.company.display_name).toEqual('Company')
        expect(result.data.company.comment).toEqual('Comment')

        expect(result.data.employees).toBeEmpty()
        expect(result.data.payments).toBeEmpty()
      })
    })

    describe('when there are employees', () => {
      let firstEmployee: Employee,
        secondEmployee: Employee,
        anotherEmployee: Employee

      beforeEach(async () => {
        firstEmployee = await prisma.employee.create({
          data: {
            company_id: company.id,
            wallet_address: '0xDEADBEEF',
            display_name: 'First Employee',
            comment: 'Note',
          },
        })

        secondEmployee = await prisma.employee.create({
          data: {
            company_id: company.id,
            display_name: 'Second Employee',
            wallet_address: '0xBEE',
            salary: 42,
            archived_at: new Date(),
          },
        })

        anotherEmployee = await prisma.employee.create({
          data: {
            company_id: anotherCompany.id,
            display_name: 'Someone Else',
            wallet_address: '0xBEER',
          },
        })
      })

      describe('when there are no payments', () => {
        it('returns a specific company, assigned employees to it, and empty payments', async () => {
          const { req, res } = mockGETRequestWithQuery({ id: company.id })

          await handler(req, res)

          expect(res._getStatusCode()).toBe(200)

          const result = parseJSON(res)

          expect(result.success).toBeTrue()

          expect(result.data.company.id).toEqual(company.id)
          expect(result.data.company.display_name).toEqual('Company')
          expect(result.data.company.comment).toEqual('Comment')

          expect(result.data.employees).toHaveLength(2)

          expect(result.data.employees[0].id).toEqual(firstEmployee.id)
          expect(result.data.employees[0].display_name).toEqual(
            'First Employee'
          )
          expect(result.data.employees[0].comment).toEqual('Note')
          expect(result.data.employees[0].salary).toEqual(0)
          expect(result.data.employees[0].archived_at).toBeNull()

          expect(result.data.employees[1].id).toEqual(secondEmployee.id)
          expect(result.data.employees[1].display_name).toEqual(
            'Second Employee'
          )
          expect(result.data.employees[1].comment).toBeNull()
          expect(result.data.employees[1].salary).toEqual(42)
          expect(result.data.employees[1].archived_at).not.toBeNull()
        })
      })

      describe('when there are payments', () => {
        let firstEmployeePayment1: Payment,
          firstEmployeePayment2: Payment,
          secondEmployeePayment: Payment

        beforeEach(async () => {
          firstEmployeePayment1 = await prisma.payment.create({
            data: {
              employee_id: firstEmployee.id,
              transaction_hash: '0xHASH1',
              wallet_address: '0xDEADBEEF',
              amount: 35,
            },
          })

          secondEmployeePayment = await prisma.payment.create({
            data: {
              employee_id: secondEmployee.id,
              transaction_hash: '0xHASH2',
              wallet_address: '0xBEE',
              amount: 42,
            },
          })

          firstEmployeePayment2 = await prisma.payment.create({
            data: {
              employee_id: firstEmployee.id,
              transaction_hash: '0xHASH3',
              wallet_address: '0xDEADBEEF',
              amount: 1,
            },
          })

          await prisma.payment.create({
            data: {
              employee_id: anotherEmployee.id,
              transaction_hash: '0xHASH4',
              wallet_address: '0xBEER',
              amount: 99,
            },
          })
        })

        it('returns a specific company, assigned employees to it, and employees payments', async () => {
          const { req, res } = mockGETRequestWithQuery({ id: company.id })

          await handler(req, res)

          expect(res._getStatusCode()).toBe(200)

          const result = parseJSON(res)

          expect(result.success).toBeTrue()

          expect(result.data.company.id).toEqual(company.id)
          expect(result.data.company.display_name).toEqual('Company')
          expect(result.data.company.comment).toEqual('Comment')

          expect(result.data.employees).toHaveLength(2)

          expect(result.data.employees[0].id).toEqual(firstEmployee.id)
          expect(result.data.employees[0].display_name).toEqual(
            'First Employee'
          )
          expect(result.data.employees[0].comment).toEqual('Note')
          expect(result.data.employees[0].salary).toEqual(0)
          expect(result.data.employees[0].archived_at).toBeNull()

          expect(result.data.employees[1].id).toEqual(secondEmployee.id)
          expect(result.data.employees[1].display_name).toEqual(
            'Second Employee'
          )
          expect(result.data.employees[1].comment).toBeNull()
          expect(result.data.employees[1].salary).toEqual(42)
          expect(result.data.employees[1].archived_at).not.toBeNull()

          expect(result.data.payments).toHaveLength(3)

          expect(result.data.payments[0].id).toEqual(firstEmployeePayment2.id)
          expect(result.data.payments[0].transaction_hash).toEqual('0xHASH3')
          expect(result.data.payments[0].wallet_address).toEqual('0xDEADBEEF')
          expect(result.data.payments[0].amount).toEqual(1)
          expect(result.data.payments[0].employee_id).toEqual(firstEmployee.id)
          expect(result.data.payments[0].created_at).not.toBeEmpty()

          expect(result.data.payments[1].id).toEqual(secondEmployeePayment.id)
          expect(result.data.payments[1].transaction_hash).toEqual('0xHASH2')
          expect(result.data.payments[1].wallet_address).toEqual('0xBEE')
          expect(result.data.payments[1].amount).toEqual(42)
          expect(result.data.payments[1].employee_id).toEqual(secondEmployee.id)
          expect(result.data.payments[1].created_at).not.toBeEmpty()

          expect(result.data.payments[2].id).toEqual(firstEmployeePayment1.id)
          expect(result.data.payments[2].transaction_hash).toEqual('0xHASH1')
          expect(result.data.payments[2].wallet_address).toEqual('0xDEADBEEF')
          expect(result.data.payments[2].amount).toEqual(35)
          expect(result.data.payments[2].employee_id).toEqual(firstEmployee.id)
          expect(result.data.payments[2].created_at).not.toBeEmpty()
        })
      })
    })
  })
})
