import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]'
import {
  cleanDatabase,
  mockDELETERequest,
  parseJSON,
} from '../../../../helpers'

const ENDPOINT = '/api/groups/[id]'

describe(`DELETE ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('when group_id is not a valid UUID', () => {
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

  describe('when a valid group is already archived', () => {
    it('returns HTTP 200 and the group data', async () => {
      const group = await prisma.group.create({
        data: {
          display_name: 'Springfield Nuclear Power Plant',
          comment: 'Workers',
          archived_at: new Date(),
        },
      })

      const { req, res } = mockDELETERequest({
        id: group.id.toString(),
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(parseJSON(res)).toEqual({
        success: true,
        data: {
          id: group.id,
          display_name: 'Springfield Nuclear Power Plant',
          comment: 'Workers',
          created_at: group.created_at.toISOString(),
          updated_at: group.updated_at.toISOString(),
          archived_at: group.archived_at?.toISOString(),
        },
      })
    })
  })

  describe('when a valid group is not archived', () => {
    it('returns HTTP 200 and the group data', async () => {
      const group = await prisma.group.create({
        data: {
          display_name: 'Springfield Nuclear Power Plant',
          comment: 'Workers',
        },
      })

      const { req, res } = mockDELETERequest({ id: group.id })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(parseJSON(res)).toEqual({
        success: true,
        data: {
          id: group.id,
          display_name: 'Springfield Nuclear Power Plant',
          comment: 'Workers',
          created_at: group.created_at.toISOString(),
          updated_at: expect.any(String),
          archived_at: expect.any(String),
        },
      })
    })
  })
})
