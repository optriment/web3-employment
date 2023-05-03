import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/companies/[id]/employees'
import { mockPOSTRequestWithQuery, parseJSON } from '../../../../../helpers'
import type { Company } from '@prisma/client'

const ENDPOINT = '/api/companies/[id]/employees'

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
        const { req, res } = mockPOSTRequestWithQuery({ id: company.id }, {})

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
        const { req, res } = mockPOSTRequestWithQuery(
          {
            id: company.id,
          },
          {
            display_name: 1,
          }
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
        const { req, res } = mockPOSTRequestWithQuery(
          {
            id: company.id,
          },
          {
            display_name: ' ',
          }
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
        const { req, res } = mockPOSTRequestWithQuery(
          {
            id: company.id,
          },
          {
            display_name: ' 1 ',
          }
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
        const { req, res } = mockPOSTRequestWithQuery(
          {
            id: company.id,
          },
          {
            display_name: ' Homer Jay Simpson ',
          }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(201)

        const response = parseJSON(res)
        expect(response.success).toBeTruthy()
        expect(response.data).not.toBeEmptyObject()
        expect(response.data.id).not.toBeEmpty()
        expect(response.data.company_id).toEqual(company.id)
        expect(response.data.display_name).toEqual('Homer Jay Simpson')
        expect(response.data.comment).toBeNull()
        expect(response.data.wallet_address).toBeNull()
        expect(response.data.contacts).toBeNull()
        expect(response.data.created_at).not.toBeEmpty()
        expect(response.data.updated_at).not.toBeEmpty()
        expect(response.data.archived_at).toBeNull()
      })
    })

    describe('with all fields', () => {
      it('returns valid response', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          {
            id: company.id,
          },
          {
            display_name: ' Homer Jay Simpson ',
            comment: ' Technical supervisor ',
            wallet_address: ' 0xDEADBEEF ',
            contacts: ' Homer_Simpson@AOL.com ',
          }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(201)

        const response = parseJSON(res)
        expect(response.success).toBeTruthy()
        expect(response.data).not.toBeEmptyObject()
        expect(response.data.id).not.toBeEmpty()
        expect(response.data.company_id).toEqual(company.id)
        expect(response.data.display_name).toEqual('Homer Jay Simpson')
        expect(response.data.comment).toEqual('Technical supervisor')
        expect(response.data.wallet_address).toEqual('0xDEADBEEF')
        expect(response.data.contacts).toEqual('Homer_Simpson@AOL.com')
        expect(response.data.created_at).not.toBeEmpty()
        expect(response.data.updated_at).not.toBeEmpty()
        expect(response.data.archived_at).toBeNull()
      })
    })
  })
})