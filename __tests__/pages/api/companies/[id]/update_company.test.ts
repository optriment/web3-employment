import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/companies/[id]'
import {
  cleanDatabase,
  mockPUTRequestWithQuery,
  parseJSON,
} from '../../../../helpers'
import type { Company } from '@prisma/client'

const ENDPOINT = '/api/companies/[id]'

beforeEach(async () => {
  await cleanDatabase(prisma)
})

describe(`PUT ${ENDPOINT}`, () => {
  describe('general errors', () => {
    describe('when company id is not a valid UUID', () => {
      it('returns error', async () => {
        const { req, res } = mockPUTRequestWithQuery({ id: 'qwe' }, {})

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

        const { req, res } = mockPUTRequestWithQuery({ id: companyId }, {})

        await handler(req, res)

        expect(res._getStatusCode()).toBe(404)
        expect(parseJSON(res)).toEqual({
          success: false,
          message: `Company ${companyId} does not exist`,
        })
      })
    })
  })

  describe('validation errors', () => {
    let company: Company

    beforeEach(async () => {
      company = await prisma.company.create({
        data: {
          display_name: 'Springfield Nuclear Power Plant',
        },
      })
    })

    describe('when display_name is missing', () => {
      it('returns error', async () => {
        const { req, res } = mockPUTRequestWithQuery({ id: company.id })

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        expect(parseJSON(res)).toEqual({
          success: false,
          validation_errors: ['Display name: Required'],
        })
      })
    })

    describe('when display_name is not a string', () => {
      it('returns error', async () => {
        const { req, res } = mockPUTRequestWithQuery(
          { id: company.id },
          { display_name: 1 }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        expect(parseJSON(res)).toEqual({
          success: false,
          validation_errors: ['Display name: Expected string, received number'],
        })
      })
    })

    describe('when display_name is an empty string', () => {
      it('returns error', async () => {
        const { req, res } = mockPUTRequestWithQuery(
          { id: company.id },
          { display_name: ' ' }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        expect(parseJSON(res)).toEqual({
          success: false,
          validation_errors: [
            'Display name: String must contain at least 2 character(s)',
          ],
        })
      })
    })

    describe('when display_name is too short', () => {
      it('returns error', async () => {
        const { req, res } = mockPUTRequestWithQuery(
          { id: company.id },
          { display_name: ' 1 ' }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        expect(parseJSON(res)).toEqual({
          success: false,
          validation_errors: [
            'Display name: String must contain at least 2 character(s)',
          ],
        })
      })
    })
  })

  describe('when everything is good', () => {
    let company: Company

    beforeEach(async () => {
      company = await prisma.company.create({
        data: {
          display_name: 'Springfield Nuclear Power Plant',
        },
      })
    })

    describe('with only required fields', () => {
      it('returns valid response', async () => {
        const { req, res } = mockPUTRequestWithQuery(
          { id: company.id },
          { display_name: ' The Simpsons ' }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(200)

        const response = parseJSON(res)
        expect(response.success).toBeTruthy()
        expect(response.data).not.toBeEmptyObject()
        expect(response.data.id).not.toBeEmpty()
        expect(response.data.display_name).toEqual('The Simpsons')
        expect(response.data.comment).toBeNull()
        expect(response.data.created_at).toEqual(
          company.created_at.toISOString()
        )
        expect(+Date.parse(response.data.updated_at)).toBeGreaterThan(
          +company.updated_at
        )
        expect(response.data.archived_at).toBeNull()
      })
    })

    describe('with all fields', () => {
      it('returns valid response', async () => {
        const { req, res } = mockPUTRequestWithQuery(
          { id: company.id },
          {
            display_name: ' The Simpsons ',
            comment: ' Family ',
          }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(200)

        const response = parseJSON(res)
        expect(response.success).toBeTruthy()
        expect(response.data).not.toBeEmptyObject()
        expect(response.data.id).not.toBeEmpty()
        expect(response.data.display_name).toEqual('The Simpsons')
        expect(response.data.comment).toEqual('Family')
        expect(response.data.created_at).toEqual(
          company.created_at.toISOString()
        )
        expect(+Date.parse(response.data.updated_at)).toBeGreaterThan(
          +company.updated_at
        )
        expect(response.data.archived_at).toBeNull()
      })
    })
  })
})
