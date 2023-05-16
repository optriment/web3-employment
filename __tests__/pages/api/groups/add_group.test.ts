import { createMocks } from 'node-mocks-http'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups'
import { cleanDatabase, mockPOSTRequest, parseJSON } from '../../../helpers'
import type { RequestMethod } from 'node-mocks-http'

const ENDPOINT = '/api/groups'

beforeEach(async () => {
  await cleanDatabase(prisma)
})

const ensureMethodNotAllowed = (method: RequestMethod, url: string) => {
  describe(`${method} ${url}`, () => {
    it('returns error', async () => {
      const { req, res } = createMocks({
        method: method,
      })

      await handler(req, res)

      expect(parseJSON(res)).toEqual({ success: false, ...METHOD_NOT_ALLOWED })
      expect(res._getStatusCode()).toBe(405)
    })
  })
}

ensureMethodNotAllowed('PUT', ENDPOINT)
ensureMethodNotAllowed('DELETE', ENDPOINT)

describe(`POST ${ENDPOINT}`, () => {
  describe('validation errors', () => {
    describe('when display_name is missing', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequest({})

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
        const { req, res } = mockPOSTRequest({ display_name: 1 })

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
        const { req, res } = mockPOSTRequest({ display_name: ' ' })

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
        const { req, res } = mockPOSTRequest({ display_name: ' 1 ' })

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
    describe('with only required fields', () => {
      it('returns valid response', async () => {
        const { req, res } = mockPOSTRequest({
          display_name: ' Springfield Nuclear Power Plant ',
        })

        await handler(req, res)

        expect(res._getStatusCode()).toBe(201)

        const response = parseJSON(res)
        expect(response.success).toBeTruthy()
        expect(response.data).not.toBeEmptyObject()
        expect(response.data.id).not.toBeEmpty()
        expect(response.data.display_name).toEqual(
          'Springfield Nuclear Power Plant'
        )
        expect(response.data.comment).toBeNull()
        expect(response.data.created_at).not.toBeEmpty()
        expect(response.data.updated_at).not.toBeEmpty()
        expect(response.data.archived_at).toBeNull()
      })
    })

    describe('with all fields', () => {
      it('returns valid response', async () => {
        const { req, res } = mockPOSTRequest({
          display_name: ' Springfield Nuclear Power Plant ',
          comment: ' Workers ',
        })

        await handler(req, res)

        expect(res._getStatusCode()).toBe(201)

        const response = parseJSON(res)
        expect(response.success).toBeTruthy()
        expect(response.data).not.toBeEmptyObject()
        expect(response.data.id).not.toBeEmpty()
        expect(response.data.display_name).toEqual(
          'Springfield Nuclear Power Plant'
        )
        expect(response.data.comment).toEqual('Workers')
        expect(response.data.created_at).not.toBeEmpty()
        expect(response.data.updated_at).not.toBeEmpty()
        expect(response.data.archived_at).toBeNull()
      })
    })
  })
})
