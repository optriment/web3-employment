import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/account'
import {
  mockGETRequest,
  parseJSON,
  cleanDatabase,
  createUserWithSession,
} from '../../../helpers'

const ENDPOINT = '/api/account'

describe(`GET ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('authorization errors', () => {
    describe('when session is not provided', () => {
      it('returns error', async () => {
        const { req, res } = mockGETRequest()

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

        const { req, res } = mockGETRequest(sessionToken)

        await handler(req, res)

        expect(res._getStatusCode()).toBe(401)

        const response = parseJSON(res)
        expect(response.success).toBeFalse()
        expect(response.message).toEqual('Authorization required')
      })
    })
  })

  describe('when authorized', () => {
    let userId: string, sessionToken: string

    describe("when user doesn't have name", () => {
      beforeEach(async () => {
        const { userId: _userId, sessionToken: _sessionToken } =
          await createUserWithSession()

        userId = _userId
        sessionToken = _sessionToken
      })

      it('returns user data', async () => {
        const { req, res } = mockGETRequest(sessionToken)

        await handler(req, res)

        expect(res.statusCode).toBe(200)
        expect(parseJSON(res)).toEqual({
          success: true,
          data: {
            id: userId,
            name: null,
            email: `${sessionToken}@domain.tld`,
            created_at: expect.toBeDateString(),
            updated_at: expect.toBeDateString(),
          },
        })
      })
    })

    describe('when user has name', () => {
      beforeEach(async () => {
        const { userId: _userId, sessionToken: _sessionToken } =
          await createUserWithSession({ name: 'Name' })

        userId = _userId
        sessionToken = _sessionToken
      })

      it('returns user data', async () => {
        const { req, res } = mockGETRequest(sessionToken)

        await handler(req, res)

        expect(res.statusCode).toBe(200)
        expect(parseJSON(res)).toEqual({
          success: true,
          data: {
            id: userId,
            name: 'Name',
            email: `${sessionToken}@domain.tld`,
            created_at: expect.toBeDateString(),
            updated_at: expect.toBeDateString(),
          },
        })
      })
    })
  })
})
