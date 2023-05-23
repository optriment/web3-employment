import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups'
import {
  cleanDatabase,
  mockPOSTRequest,
  parseJSON,
  createUserWithSession,
} from '../../../helpers'

const ENDPOINT = '/api/groups'

describe(`POST ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('authorization errors', () => {
    describe('when session is not provided', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequest()

        await handler(req, res)

        expect(res._getStatusCode()).toBe(401)

        const response = parseJSON(res)
        expect(response.success).toBeFalse()
        expect(response.message).toEqual('Authorization required')
      })
    })

    describe('when invalid session provided', () => {
      it('returns error', async () => {
        const sessionToken = uuidv4()

        const { req, res } = mockPOSTRequest({}, sessionToken)

        await handler(req, res)

        expect(res._getStatusCode()).toBe(401)

        const response = parseJSON(res)
        expect(response.success).toBeFalse()
        expect(response.message).toEqual('Authorization required')
      })
    })
  })

  describe('validation errors', () => {
    let sessionToken: string

    beforeEach(async () => {
      const { sessionToken: _sessionToken } = await createUserWithSession()

      sessionToken = _sessionToken
    })

    describe('when display_name is missing', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequest({}, sessionToken)

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
        const { req, res } = mockPOSTRequest({ display_name: 1 }, sessionToken)

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
        const { req, res } = mockPOSTRequest(
          { display_name: ' ' },
          sessionToken
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
        const { req, res } = mockPOSTRequest(
          { display_name: ' 1 ' },
          sessionToken
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
    let sessionToken: string

    beforeEach(async () => {
      const { sessionToken: _sessionToken } = await createUserWithSession()

      sessionToken = _sessionToken
    })

    describe('with only required fields', () => {
      it('returns valid response', async () => {
        const { req, res } = mockPOSTRequest(
          {
            display_name: ' Springfield Nuclear Power Plant ',
          },
          sessionToken
        )

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
        const { req, res } = mockPOSTRequest(
          {
            display_name: ' Springfield Nuclear Power Plant ',
            comment: ' Workers ',
          },
          sessionToken
        )

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
