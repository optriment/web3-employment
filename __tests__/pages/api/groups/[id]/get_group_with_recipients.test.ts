import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]'
import {
  cleanDatabase,
  mockGETRequestWithQuery,
  parseJSON,
  createUserWithSession,
} from '../../../../helpers'
import type { Group, Recipient } from '@prisma/client'

const ENDPOINT = '/api/groups/[id]'

describe(`GET ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('authorization errors', () => {
    describe('when session is not provided', () => {
      it('returns error', async () => {
        const groupId = uuidv4()

        const { req, res } = mockGETRequestWithQuery({ id: groupId })

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

        const { req, res } = mockGETRequestWithQuery(
          { id: groupId },
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
        const { req, res } = mockGETRequestWithQuery(
          { id: 'qwe' },
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

        const { req, res } = mockGETRequestWithQuery(
          { id: groupId },
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

    describe('when requested group belongs to another user', () => {
      let group: Group

      beforeEach(async () => {
        const { userId: anotherUserId } = await createUserWithSession()

        group = await prisma.group.create({
          data: {
            userId: anotherUserId,
            display_name: 'Springfield Nuclear Power Plant (Workers)',
            comment: 'Workers',
          },
        })
      })

      it('returns error', async () => {
        const { req, res } = mockGETRequestWithQuery(
          { id: group.id },
          sessionToken
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(404)

        const result = parseJSON(res)

        expect(result.success).toBeFalse()
        expect(result.message).toEqual('Group does not exist')
      })
    })

    describe('when group exists', () => {
      let group: Group, anotherGroup: Group

      beforeEach(async () => {
        group = await prisma.group.create({
          data: {
            userId: userId,
            display_name: 'Springfield Nuclear Power Plant (Workers)',
            comment: 'Workers',
          },
        })

        anotherGroup = await prisma.group.create({
          data: {
            userId: userId,
            display_name: 'Springfield Nuclear Power Plant (Staff)',
          },
        })
      })

      describe('when there are no recipients', () => {
        it('returns a specific group and empty recipients array', async () => {
          const { req, res } = mockGETRequestWithQuery(
            { id: group.id },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(200)

          const result = parseJSON(res)

          expect(result.success).toBeTrue()
          expect(result.data.group.id).toEqual(group.id)
          expect(result.data.group.display_name).toEqual(
            'Springfield Nuclear Power Plant (Workers)'
          )
          expect(result.data.group.comment).toEqual('Workers')
          expect(result.data.recipients).toBeEmpty()
        })
      })

      describe('when there are recipients', () => {
        let firstRecipient: Recipient, secondRecipient: Recipient

        beforeEach(async () => {
          firstRecipient = await prisma.recipient.create({
            data: {
              group_id: group.id,
              display_name: 'Homer Jay Simpson',
              comment: 'Technical supervisor',
            },
          })

          secondRecipient = await prisma.recipient.create({
            data: {
              group_id: group.id,
              display_name: 'Lenny Leonard',
              salary: 42,
              archived_at: new Date(),
            },
          })

          await prisma.recipient.create({
            data: {
              group_id: anotherGroup.id,
              display_name: 'Montgomery Burns',
            },
          })
        })

        it('returns a specific group and assigned recipients to it', async () => {
          const { req, res } = mockGETRequestWithQuery(
            { id: group.id },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(200)

          const result = parseJSON(res)

          expect(result.success).toBeTrue()

          expect(result.data.group.id).toEqual(group.id)
          expect(result.data.group.display_name).toEqual(
            'Springfield Nuclear Power Plant (Workers)'
          )
          expect(result.data.group.comment).toEqual('Workers')

          expect(result.data.recipients).toHaveLength(2)

          expect(result.data.recipients[0].id).toEqual(firstRecipient.id)
          expect(result.data.recipients[0].display_name).toEqual(
            'Homer Jay Simpson'
          )
          expect(result.data.recipients[0].comment).toEqual(
            'Technical supervisor'
          )
          expect(result.data.recipients[0].salary).toEqual(0)
          expect(result.data.recipients[0].archived_at).toBeNull()

          expect(result.data.recipients[1].id).toEqual(secondRecipient.id)
          expect(result.data.recipients[1].display_name).toEqual(
            'Lenny Leonard'
          )
          expect(result.data.recipients[1].comment).toBeNull()
          expect(result.data.recipients[1].salary).toEqual(42)
          expect(result.data.recipients[1].archived_at).not.toBeNull()
        })
      })
    })
  })
})
