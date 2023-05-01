import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/companies/[id]'
import { mockGETRequestWithQuery, parseJSON } from '../../../helpers'
import type { Company, Employee } from '@prisma/client'

const ENDPOINT = '/api/companies/[id]'

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
      it('returns a specific company and empty employees array', async () => {
        const { req, res } = mockGETRequestWithQuery({ id: company.id })

        await handler(req, res)

        expect(res._getStatusCode()).toBe(200)

        const result = parseJSON(res)

        expect(result.success).toBeTrue()
        expect(result.data.company.id).toEqual(company.id)
        expect(result.data.company.display_name).toEqual('Company')
        expect(result.data.company.comment).toEqual('Comment')
        expect(result.data.employees).toBeEmpty()
      })
    })

    describe('when there are employees', () => {
      let firstEmployee: Employee, secondEmployee: Employee

      beforeEach(async () => {
        firstEmployee = await prisma.employee.create({
          data: {
            company_id: company.id,
            display_name: 'First Employee',
            comment: 'Note',
          },
        })

        secondEmployee = await prisma.employee.create({
          data: {
            company_id: company.id,
            display_name: 'Second Employee',
          },
        })

        await prisma.employee.create({
          data: {
            company_id: anotherCompany.id,
            display_name: 'Someone Else',
          },
        })
      })

      it('returns a specific company and assigned employees to it', async () => {
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
        expect(result.data.employees[1].id).toEqual(secondEmployee.id)
      })
    })
  })
})
