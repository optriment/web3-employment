import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]/unarchive'
import {
  cleanDatabase,
  mockPOSTRequestWithQuery,
  parseJSON,
  createUserWithSession,
} from '../../../../../helpers'

const ENDPOINT = '/api/groups/[id]/unarchive'

describe(`POST ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('authorization errors', () => {
    describe('when session is not provided', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery({ id: 'invalid-id' }, {})

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

        const { req, res } = mockPOSTRequestWithQuery(
          { id: 'invalid-id' },
          {},
          sessionToken
        )

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

    describe('when group_id is not a valid UUID', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          { id: 'invalid-id' },
          {},
          sessionToken
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(500)
        expect(parseJSON(res)).toEqual({
          success: false,
          message: 'Invalid UUID',
        })
      })
    })

    describe('when group does not exist', () => {
      it('returns error', async () => {
        const groupId = uuidv4()

        const { req, res } = mockPOSTRequestWithQuery(
          { id: groupId },
          {},
          sessionToken
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(404)
        expect(parseJSON(res)).toEqual({
          success: false,
          message: `Group does not exist`,
        })
      })
    })

    describe('when a valid group is not archived', () => {
      it('returns HTTP 200 with the group data', async () => {
        const group = await prisma.group.create({
          data: {
            userId: userId,
            displayName: 'Springfield Nuclear Power Plant',
            comment: 'Workers',
          },
        })

        const { req, res } = mockPOSTRequestWithQuery(
          { id: group.id },
          {},
          sessionToken
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(200)
        expect(parseJSON(res)).toEqual({
          success: true,
          data: {
            id: group.id,
            display_name: 'Springfield Nuclear Power Plant',
            comment: 'Workers',
            created_at: group.createdAt.toISOString(),
            updated_at: group.updatedAt.toISOString(),
            archived_at: null,
          },
        })
      })
    })

    describe('when a valid group is archived', () => {
      it('returns HTTP 200 and the group data', async () => {
        const group = await prisma.group.create({
          data: {
            userId: userId,
            displayName: 'Springfield Nuclear Power Plant',
            comment: 'Workers',
            archivedAt: new Date(),
          },
        })

        const { req, res } = mockPOSTRequestWithQuery(
          { id: group.id },
          {},
          sessionToken
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(200)
        expect(parseJSON(res)).toEqual({
          success: true,
          data: {
            id: group.id,
            display_name: 'Springfield Nuclear Power Plant',
            comment: 'Workers',
            created_at: group.createdAt.toISOString(),
            updated_at: expect.any(String),
            archived_at: null,
          },
        })
      })
    })
  })
})
