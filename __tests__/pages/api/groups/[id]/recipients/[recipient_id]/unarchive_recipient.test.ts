import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]/recipients/[recipient_id]/unarchive'
import {
  cleanDatabase,
  mockPOSTRequestWithQuery,
  parseJSON,
  createUserWithSession,
} from '../../../../../../helpers'
import type { Group } from '@prisma/client'

const ENDPOINT = '/api/groups/[id]/recipients/[recipient_id]/unarchive'

describe(`POST ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('authorization errors', () => {
    describe('when session is not provided', () => {
      it('returns error', async () => {
        const groupId = uuidv4()

        const { req, res } = mockPOSTRequestWithQuery({ id: groupId })

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

        const groupId = uuidv4()

        const { req, res } = mockPOSTRequestWithQuery(
          { id: groupId },
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
          { id: 'qwe' },
          {},
          sessionToken
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(500)
        expect(parseJSON(res)).toEqual({
          success: false,
          message: `Invalid UUID`,
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

    describe('when group exists', () => {
      let group: Group

      beforeEach(async () => {
        group = await prisma.group.create({
          data: {
            userId: userId,
            display_name: 'Springfield Nuclear Power Plant',
          },
        })
      })

      describe('when recipient_id is not a valid UUID', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
              recipient_id: 'invalid-id',
            },
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

      describe('when recipient does not exist', () => {
        it('returns error', async () => {
          const recipientId = uuidv4()

          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
              recipient_id: recipientId,
            },
            {},
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(404)
          expect(parseJSON(res)).toEqual({
            success: false,
            message: `Recipient does not exist`,
          })
        })
      })

      describe('when a valid recipient is not archived', () => {
        it('returns HTTP 200 and the recipient data', async () => {
          const recipient = await prisma.recipient.create({
            data: {
              group_id: group.id,
              display_name: 'Homer Jay Simpson',
            },
          })

          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
              recipient_id: recipient.id,
            },
            {},
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(200)
          expect(parseJSON(res)).toEqual({
            success: true,
            data: {
              id: recipient.id,
              display_name: 'Homer Jay Simpson',
              comment: null,
              contacts: null,
              wallet_address: null,
              salary: 0,
              created_at: recipient.created_at.toISOString(),
              updated_at: recipient.updated_at.toISOString(),
              archived_at: null,
            },
          })
        })
      })

      describe('when a valid recipient is archived', () => {
        it('returns HTTP 200 and the recipient data', async () => {
          const recipient = await prisma.recipient.create({
            data: {
              group_id: group.id,
              display_name: 'Homer Jay Simpson',
              archived_at: new Date(),
            },
          })

          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
              recipient_id: recipient.id,
            },
            {},
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(200)
          expect(parseJSON(res)).toEqual({
            success: true,
            data: {
              id: recipient.id,
              display_name: 'Homer Jay Simpson',
              comment: null,
              contacts: null,
              wallet_address: null,
              salary: 0,
              created_at: recipient.created_at.toISOString(),
              updated_at: expect.any(String),
              archived_at: null,
            },
          })
        })
      })
    })
  })
})
