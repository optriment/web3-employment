import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]/batch_payment'
import {
  cleanDatabase,
  mockPOSTRequestWithQuery,
  parseJSON,
  createUserWithSession,
} from '../../../../helpers'
import type { Group } from '@prisma/client'

const ENDPOINT = '/api/groups/[id]/batch_payment'

describe(`POST ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('authorization errors', () => {
    describe('when session is not provided', () => {
      it('returns error', async () => {
        const groupId = uuidv4()

        const { req, res } = mockPOSTRequestWithQuery({ id: groupId }, {})

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

    describe('general errors', () => {
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
        describe('when group is archived', () => {
          it('returns error', async () => {
            const group = await prisma.group.create({
              data: {
                userId: userId,
                displayName: 'Springfield Nuclear Power Plant',
                archivedAt: new Date(),
              },
            })

            const { req, res } = mockPOSTRequestWithQuery(
              { id: group.id },
              {},
              sessionToken
            )

            await handler(req, res)

            expect(res._getStatusCode()).toBe(400)
            expect(parseJSON(res)).toEqual({
              success: false,
              message: `Group is archived`,
            })
          })
        })
      })
    })

    describe('validation errors', () => {
      let group: Group

      beforeEach(async () => {
        group = await prisma.group.create({
          data: {
            userId: userId,
            displayName: 'Springfield Nuclear Power Plant',
          },
        })
      })

      describe('when required fields are missing', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            {},
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          const result = parseJSON(res)

          expect(result.success).toBeFalse()
          expect(result.validation_errors).toHaveLength(3)
          expect(result.validation_errors).toIncludeAllMembers([
            'Transaction hash: Required',
            'Recipients count: Required',
            'Total amount: Required',
          ])
        })
      })

      describe('when transaction_hash is not a string', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            { transaction_hash: 1, recipients_count: 1, total_amount: 1 },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Transaction hash: Expected string, received number',
            ],
          })
        })
      })

      describe('when transaction_hash is an empty string', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            { transaction_hash: ' ', recipients_count: 1, total_amount: 1 },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Transaction hash: String must contain at least 2 character(s)',
            ],
          })
        })
      })

      describe('when transaction_hash is too short', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            { transaction_hash: ' 1 ', recipients_count: 1, total_amount: 1 },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Transaction hash: String must contain at least 2 character(s)',
            ],
          })
        })
      })

      describe('when recipients_count is not a number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            { transaction_hash: '123', recipients_count: '1', total_amount: 1 },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Recipients count: Expected number, received string',
            ],
          })
        })
      })

      describe('when recipients_count is a negative number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            { transaction_hash: '123', recipients_count: -1, total_amount: 1 },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Recipients count: Number must be greater than 0',
            ],
          })
        })
      })

      describe('when recipients_count is zero', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            { transaction_hash: '123', recipients_count: 0, total_amount: 1 },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Recipients count: Number must be greater than 0',
            ],
          })
        })
      })

      describe('when recipients_count is a float number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            {
              transaction_hash: '123',
              recipients_count: 0.01,
              total_amount: 1,
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Recipients count: Expected integer, received float',
            ],
          })
        })
      })

      describe('when total_amount is not a number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            { transaction_hash: '123', recipients_count: 1, total_amount: '1' },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Total amount: Expected number, received string',
            ],
          })
        })
      })

      describe('when total_amount is a negative number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            { transaction_hash: '123', recipients_count: 1, total_amount: -1 },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Total amount: Number must be greater than 0'],
          })
        })
      })

      describe('when total_amount is zero', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            { transaction_hash: '123', recipients_count: 1, total_amount: 0 },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Total amount: Number must be greater than 0'],
          })
        })
      })

      describe('when total_amount is a float number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            {
              transaction_hash: '123',
              recipients_count: 1,
              total_amount: 0.01,
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Total amount: Expected integer, received float',
            ],
          })
        })
      })
    })

    describe('when everything is good', () => {
      let group: Group

      beforeEach(async () => {
        group = await prisma.group.create({
          data: {
            userId: userId,
            displayName: 'Springfield Nuclear Power Plant',
          },
        })
      })

      it('returns valid response', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          { id: group.id },
          { transaction_hash: '123', recipients_count: 1, total_amount: 1 },
          sessionToken
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(201)

        const response = parseJSON(res)

        expect(response.success).toBeTruthy()
        expect(response.data).not.toBeEmptyObject()
        expect(response.data.id).not.toBeEmpty()
        expect(response.data.group_id).toEqual(group.id)
        expect(response.data.transaction_hash).toEqual('123')
        expect(response.data.recipients_count).toEqual(1)
        expect(response.data.total_amount).toEqual(1)
        expect(response.data.created_at).not.toBeEmpty()
      })
    })
  })
})
