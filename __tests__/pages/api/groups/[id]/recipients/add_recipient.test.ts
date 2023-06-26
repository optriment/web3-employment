import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]/recipients'
import {
  cleanDatabase,
  mockPOSTRequestWithQuery,
  parseJSON,
  createUserWithSession,
} from '../../../../../helpers'
import type { Group } from '@prisma/client'

const ENDPOINT = '/api/groups/[id]/recipients'

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

      describe('when display_name is missing', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            { wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ' },
            sessionToken
          )

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
          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
            },
            {
              display_name: 1,
              wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Display name: Expected string, received number',
            ],
          })
        })
      })

      describe('when display_name is an empty string', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
            },
            {
              display_name: ' ',
              wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
            },
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
          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
            },
            {
              display_name: ' 1 ',
              wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
            },
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

      describe('when wallet_address is missing', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id },
            { display_name: ' Homer Jay Simpson ' },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Wallet address: Required'],
          })
        })
      })

      describe('when wallet_address is not a string', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
            },
            {
              display_name: ' Homer Jay Simpson ',
              wallet_address: 1,
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Wallet address: Expected string, received number',
            ],
          })
        })
      })

      describe('when wallet_address is an empty string', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
            },
            {
              display_name: ' Homer Jay Simpson ',
              wallet_address: ' ',
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Wallet address: Invalid wallet address'],
          })
        })
      })

      describe('when wallet_address is an invalid address', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
            },
            {
              display_name: ' Homer Jay Simpson ',
              wallet_address: '0xabc',
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Wallet address: Invalid wallet address'],
          })
        })
      })

      describe('when salary is a negative number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
            },
            {
              display_name: 'Homer Jay Simpson',
              wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
              salary: -1,
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Salary: Number must be greater than or equal to 0',
            ],
          })
        })
      })

      describe('when salary is a float number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
            },
            {
              display_name: 'Homer Jay Simpson',
              wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
              salary: 0.1,
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Salary: Expected integer, received float'],
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

      describe('with only required fields', () => {
        it('returns valid response', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
            },
            {
              display_name: ' Homer Jay Simpson ',
              wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(201)

          const response = parseJSON(res)
          expect(response.success).toBeTruthy()
          expect(response.data).not.toBeEmptyObject()
          expect(response.data.id).not.toBeEmpty()
          expect(response.data.display_name).toEqual('Homer Jay Simpson')
          expect(response.data.comment).toBeNull()
          expect(response.data.wallet_address).toEqual(
            'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ'
          )
          expect(response.data.contacts).toBeNull()
          expect(response.data.salary).toEqual(0)
          expect(response.data.created_at).not.toBeEmpty()
          expect(response.data.updated_at).not.toBeEmpty()
          expect(response.data.archived_at).toBeNull()
        })
      })

      describe('with all fields', () => {
        it('returns valid response', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            {
              id: group.id,
            },
            {
              display_name: ' Homer Jay Simpson ',
              comment: ' Technical supervisor ',
              wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
              contacts: ' Homer_Simpson@AOL.com ',
              salary: 42,
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(201)

          const response = parseJSON(res)
          expect(response.success).toBeTruthy()
          expect(response.data).not.toBeEmptyObject()
          expect(response.data.id).not.toBeEmpty()
          expect(response.data.display_name).toEqual('Homer Jay Simpson')
          expect(response.data.comment).toEqual('Technical supervisor')
          expect(response.data.wallet_address).toEqual(
            'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ'
          )
          expect(response.data.contacts).toEqual('Homer_Simpson@AOL.com')
          expect(response.data.salary).toEqual(42)
          expect(response.data.created_at).not.toBeEmpty()
          expect(response.data.updated_at).not.toBeEmpty()
          expect(response.data.archived_at).toBeNull()
        })
      })
    })
  })
})
