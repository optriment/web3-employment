import { v4 as uuidv4 } from 'uuid'
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

  describe('when an invalid company id is provided', () => {
    it('returns error ', async () => {
      const { req, res } = mockDELETERequest({ id: 'invalid-id' })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(parseJSON(res)).toEqual({
        success: false,
        message: 'Invalid UUID',
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

  describe('when a valid company is already archived', () => {
    it('returns HTTP 200 and the archived company data', async () => {
      const company: Company = await prisma.company.create({
        data: {
          display_name: 'Test Company',
          comment: 'This is a test company',
          archived_at: new Date(),
        },
      })

      const { req, res } = mockDELETERequest({
        id: company.id.toString(),
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(parseJSON(res)).toEqual({
        success: true,
        data: {
          id: company.id,
          display_name: 'Test Company',
          comment: 'This is a test company',
          created_at: company.created_at.toISOString(),
          updated_at: company.updated_at.toISOString(),
          archived_at: company.archived_at?.toISOString(),
        },
      })
    })
  })

  describe('when a valid company is successfully archived', () => {
    it('returns HTTP 200 and the archived company data', async () => {
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
        data: {
          id: company.id,
          display_name: 'Test Company',
          comment: 'This is a test company',
          created_at: company.created_at.toISOString(),
          updated_at: expect.any(String),
          archived_at: expect.any(String),
        },
      })
    })
  })
})
