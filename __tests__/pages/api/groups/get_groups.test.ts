import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups'
import {
  mockGETRequest,
  parseJSON,
  cleanDatabase,
  createUserWithSession,
} from '../../../helpers'

const ENDPOINT = '/api/groups'

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

    beforeEach(async () => {
      const { userId: _userId, sessionToken: _sessionToken } =
        await createUserWithSession()

      userId = _userId
      sessionToken = _sessionToken
    })

    it('returns an empty array when there are no groups in the database', async () => {
      const { req, res } = mockGETRequest(sessionToken)

      await handler(req, res)

      expect(res.statusCode).toBe(200)
      expect(parseJSON(res)).toEqual({ success: true, data: [] })
    })

    it('returns an array of groups with all attributes when there are groups in the database', async () => {
      const group1 = await prisma.group.create({
        data: {
          userId: userId,
          displayName: 'Springfield Nuclear Power Plant (Workers)',
          comment: 'Workers',
        },
      })

      const group2 = await prisma.group.create({
        data: {
          userId: userId,
          displayName: 'Springfield Nuclear Power Plant (Staff)',
          comment: 'Staff',
          archivedAt: new Date(),
        },
      })

      const { req, res } = mockGETRequest(sessionToken)

      await handler(req, res)

      expect(res.statusCode).toBe(200)
      expect(parseJSON(res)).toEqual({
        success: true,
        data: [
          {
            id: group2.id,
            display_name: 'Springfield Nuclear Power Plant (Staff)',
            comment: 'Staff',
            created_at: group2.createdAt.toISOString(),
            updated_at: group2.updatedAt.toISOString(),
            archived_at: group2.archivedAt?.toISOString(),
          },
          {
            id: group1.id,
            display_name: 'Springfield Nuclear Power Plant (Workers)',
            comment: 'Workers',
            created_at: group1.createdAt.toISOString(),
            updated_at: group1.updatedAt.toISOString(),
            archived_at: null,
          },
        ],
      })
    })
  })
})
