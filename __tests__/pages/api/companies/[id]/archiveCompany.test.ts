import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/companies/[id]'
import {
  cleanDatabase,
  mockDELETERequest,
  parseJSON,
} from '../../../../helpers'
import type { Company } from '@prisma/client'

const ENDPOINT = '/api/companies/[id]'

describe(`DELETE ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('when a valid company is successfully archived', () => {
    it('returns HTTP 200 and success message', async () => {
      const company: Company = await prisma.company.create({
        data: {
          display_name: 'Test Company',
          comment: 'This is a test company',
        },
      })

      const { req, res } = mockDELETERequest({ id: company.id })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(parseJSON(res)).toEqual({
        success: true,
        message: 'Company archived successfully',
      })

      const archivedCompany = await prisma.company.findUnique({
        where: { id: company.id },
      })

      expect(archivedCompany?.archived_at).not.toBeNull()
    })
  })

  describe('when a valid company is already archived', () => {
    it('returns HTTP 200 and success message', async () => {
      const company: Company = await prisma.company.create({
        data: {
          display_name: 'Test Company',
          comment: 'This is a test company',
        },
      })

      const { req: firstReq, res: firstRes } = mockDELETERequest({
        id: company.id.toString(),
      })

      await handler(firstReq, firstRes)

      expect(firstRes._getStatusCode()).toBe(200)
      expect(parseJSON(firstRes)).toEqual({
        message: 'Company archived successfully',
        success: true,
      })

      const { req: secondReq, res: secondRes } = mockDELETERequest({
        id: company.id.toString(),
      })

      await handler(secondReq, secondRes)

      expect(secondRes._getStatusCode()).toBe(200)
      expect(parseJSON(secondRes)).toEqual({
        message: 'Company already archived',
        success: true,
      })

      const archivedCompany = await prisma.company.findUnique({
        where: { id: company.id },
      })

      expect(archivedCompany?.archived_at).not.toBeNull()
    })
  })

  describe('when an invalid company id is provided', () => {
    it('returns an error message', async () => {
      const { req, res } = mockDELETERequest({ id: 'invalid-id' })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(parseJSON(res)).toEqual({
        success: false,
        message: 'Invalid UUID',
      })
    })
  })

  describe('when the company is already archived', () => {
    it('does not update the archived_at field', async () => {
      const company: Company = await prisma.company.create({
        data: {
          display_name: 'Test Company',
          comment: 'This is a test company',
        },
      })

      const { req: firstReq, res: firstRes } = mockDELETERequest({
        id: company.id.toString(),
      })

      await handler(firstReq, firstRes)

      expect(firstRes._getStatusCode()).toBe(200)
      expect(parseJSON(firstRes)).toEqual({
        message: 'Company archived successfully',
        success: true,
      })

      const archivedCompanyBefore = await prisma.company.findUnique({
        where: { id: company.id },
      })

      expect(archivedCompanyBefore?.archived_at).not.toBeNull()

      const { req: secondReq, res: secondRes } = mockDELETERequest({
        id: company.id.toString(),
      })

      await handler(secondReq, secondRes)

      expect(parseJSON(secondRes)).toEqual({
        message: 'Company already archived',
        success: true,
      })

      const archivedCompanyAfter = await prisma.company.findUnique({
        where: { id: company.id },
      })

      expect(archivedCompanyAfter?.archived_at).toEqual(
        archivedCompanyBefore?.archived_at
      )
    })
  })
})
