import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]/recipients/[recipient_id]'
import {
  cleanDatabase,
  mockPUTRequestWithQuery,
  parseJSON,
  createUserWithSession,
} from '../../../../../../helpers'
import type { Group, Recipient } from '@prisma/client'

const ENDPOINT = '/api/groups/[id]/recipients/[recipient_id]'

describe(`PUT ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('authorization errors', () => {
    describe('when session is not provided', () => {
      it('returns error', async () => {
        const groupId = uuidv4()

        const { req, res } = mockPUTRequestWithQuery({ id: groupId }, {})

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

        const { req, res } = mockPUTRequestWithQuery(
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
          const { req, res } = mockPUTRequestWithQuery(
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

          const { req, res } = mockPUTRequestWithQuery(
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
              displayName: 'Springfield Nuclear Power Plant',
            },
          })
        })

        describe('when recipient_id is not a valid UUID', () => {
          it('returns error', async () => {
            const { req, res } = mockPUTRequestWithQuery(
              { id: group.id, recipient_id: 'qwe' },
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

        describe('when recipient does not exist', () => {
          it('returns error', async () => {
            const recipientId = uuidv4()

            const { req, res } = mockPUTRequestWithQuery(
              { id: group.id, recipient_id: recipientId },
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
      })
    })

    describe('validation errors', () => {
      let group: Group, recipient: Recipient

      beforeEach(async () => {
        group = await prisma.group.create({
          data: {
            userId: userId,
            displayName: 'Springfield Nuclear Power Plant',
          },
        })

        recipient = await prisma.recipient.create({
          data: {
            groupId: group.id,
            displayName: 'Homer Jay Simpson',
            walletAddress: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
          },
        })
      })

      describe('when display_name is missing', () => {
        it('returns error', async () => {
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { wallet_address: recipient.walletAddress },
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
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { display_name: 1, wallet_address: recipient.walletAddress },
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
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { display_name: ' ', wallet_address: recipient.walletAddress },
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
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { display_name: ' 1 ', wallet_address: recipient.walletAddress },
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
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { display_name: recipient.displayName },
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
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { display_name: recipient.displayName, wallet_address: 1 },
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
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { display_name: recipient.displayName, wallet_address: ' ' },
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
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { display_name: recipient.displayName, wallet_address: '0xabc' },
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
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            {
              display_name: 'Homer Jay Simpson',
              wallet_address: recipient.walletAddress,
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

      describe('when salary is a floating number', () => {
        it('returns error', async () => {
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            {
              display_name: 'Homer Jay Simpson',
              wallet_address: recipient.walletAddress,
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
      let group: Group, recipient: Recipient

      beforeEach(async () => {
        group = await prisma.group.create({
          data: {
            userId: userId,
            displayName: 'Springfield Nuclear Power Plant',
          },
        })

        recipient = await prisma.recipient.create({
          data: {
            groupId: group.id,
            displayName: 'Homer Jay Simpson',
            comment: 'Technical supervisor',
            walletAddress: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
            contacts: 'Homer_Simpson@AOL.com',
            salary: 35000000,
          },
        })
      })

      describe('with only required fields', () => {
        it('returns valid response', async () => {
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            {
              display_name: ' Bart ',
              wallet_address: recipient.walletAddress,
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(200)

          const response = parseJSON(res)
          expect(response.success).toBeTruthy()
          expect(response.data).not.toBeEmptyObject()
          expect(response.data.id).not.toBeEmpty()
          expect(response.data.display_name).toEqual('Bart')
          expect(response.data.comment).toEqual('Technical supervisor')
          expect(response.data.wallet_address).toEqual(
            'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ'
          )
          expect(response.data.contacts).toEqual('Homer_Simpson@AOL.com')
          expect(response.data.salary).toEqual(35000000)
          expect(response.data.created_at).toEqual(
            recipient.createdAt.toISOString()
          )
          expect(+Date.parse(response.data.updated_at)).toBeGreaterThan(
            +recipient.updatedAt
          )
          expect(response.data.archived_at).toBeNull()
        })
      })

      describe('with all fields', () => {
        it('returns valid response', async () => {
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            {
              display_name: ' Bart Simpson ',
              comment: ' Son ',
              wallet_address: ' TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ ',
              contacts: ' Bart@AOL.com ',
              salary: 10000 * 10 ** 6, // 10K USDT
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(200)

          const response = parseJSON(res)
          expect(response.success).toBeTruthy()
          expect(response.data).not.toBeEmptyObject()
          expect(response.data.id).not.toBeEmpty()
          expect(response.data.display_name).toEqual('Bart Simpson')
          expect(response.data.comment).toEqual('Son')
          expect(response.data.wallet_address).toEqual(
            'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ'
          )
          expect(response.data.contacts).toEqual('Bart@AOL.com')
          expect(response.data.salary).toEqual(10000000000)
          expect(response.data.created_at).toEqual(
            recipient.createdAt.toISOString()
          )
          expect(+Date.parse(response.data.updated_at)).toBeGreaterThan(
            +recipient.updatedAt
          )
          expect(response.data.archived_at).toBeNull()

          const updatedRecipient = await prisma.recipient.findUnique({
            where: {
              id: recipient.id,
            },
          })

          expect(updatedRecipient).not.toBeNull()
          expect(updatedRecipient?.displayName).toEqual('Bart Simpson')
          expect(updatedRecipient?.comment).toEqual('Son')
          expect(updatedRecipient?.walletAddress).toEqual(
            'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ'
          )
          expect(updatedRecipient?.contacts).toEqual('Bart@AOL.com')
          expect(updatedRecipient?.salary).toEqual(BigInt(10000 * 10 ** 6))
        })
      })
    })
  })
})
