import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]/recipients/[recipient_id]'
import {
  cleanDatabase,
  mockDELETERequest,
  parseJSON,
} from '../../../../../../helpers'
import type { Group } from '@prisma/client'

const ENDPOINT = '/api/groups/[id]/recipients/[recipient_id]'

describe(`DELETE ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('when group_id is not a valid UUID', () => {
    it('returns error', async () => {
      const { req, res } = mockDELETERequest({ id: 'qwe' })

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

      const { req, res } = mockDELETERequest({ id: groupId })

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
          display_name: 'Springfield Nuclear Power Plant',
        },
      })
    })

    describe('when recipient_id is not a valid UUID', () => {
      it('returns error', async () => {
        const { req, res } = mockDELETERequest({
          id: group.id,
          recipient_id: 'invalid-id',
        })

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

        const { req, res } = mockDELETERequest({
          id: group.id,
          recipient_id: recipientId,
        })

        await handler(req, res)

        expect(res._getStatusCode()).toBe(404)
        expect(parseJSON(res)).toEqual({
          success: false,
          message: `Recipient does not exist`,
        })
      })
    })

    describe('when a valid recipient is already archived', () => {
      it('returns HTTP 200 and the archived recipient data', async () => {
        const recipient = await prisma.recipient.create({
          data: {
            group_id: group.id,
            display_name: 'Homer Jay Simpson',
            archived_at: new Date(),
          },
        })

        const { req, res } = mockDELETERequest({
          id: group.id,
          recipient_id: recipient.id,
        })

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
            archived_at: recipient.archived_at?.toISOString(),
          },
        })
      })
    })

    describe('when a valid recipient is not archived', () => {
      it('returns HTTP 200 and the archived recipient data', async () => {
        const recipient = await prisma.recipient.create({
          data: {
            group_id: group.id,
            display_name: 'Homer Jay Simpson',
          },
        })

        const { req, res } = mockDELETERequest({
          id: group.id,
          recipient_id: recipient.id,
        })

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
            archived_at: expect.any(String),
          },
        })
      })
    })
  })
})
