import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]/recipients/[recipient_id]/payment'
import {
  cleanDatabase,
  mockPOSTRequestWithQuery,
  parseJSON,
  createUserWithSession,
} from '../../../../../../helpers'
import type { Group, Recipient } from '@prisma/client'

const ENDPOINT = '/api/groups/[id]/recipients/[recipient_id]/payment'

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
                display_name: 'Springfield Nuclear Power Plant',
                archived_at: new Date(),
              },
            })

            const { req, res } = mockPOSTRequestWithQuery(
              { id: group.id, recipient_id: 'qwe' },
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

        describe('when group is active', () => {
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

              const { req, res } = mockPOSTRequestWithQuery(
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

          describe('when recipient does not have wallet', () => {
            it('returns error', async () => {
              const recipient = await prisma.recipient.create({
                data: {
                  group_id: group.id,
                  display_name: 'Homer Jay Simpson',
                },
              })

              const { req, res } = mockPOSTRequestWithQuery(
                { id: group.id, recipient_id: recipient.id },
                {},
                sessionToken
              )

              await handler(req, res)

              expect(res._getStatusCode()).toBe(400)
              expect(parseJSON(res)).toEqual({
                success: false,
                message: `Recipient doesn't have wallet`,
              })
            })
          })

          describe('when recipient is archived', () => {
            it('returns error', async () => {
              const recipient = await prisma.recipient.create({
                data: {
                  group_id: group.id,
                  display_name: 'Homer Jay Simpson',
                  wallet_address: '0xDEADBEEF',
                  archived_at: new Date(),
                },
              })

              const { req, res } = mockPOSTRequestWithQuery(
                { id: group.id, recipient_id: recipient.id },
                {},
                sessionToken
              )

              await handler(req, res)

              expect(res._getStatusCode()).toBe(400)
              expect(parseJSON(res)).toEqual({
                success: false,
                message: `Recipient is archived`,
              })
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
            display_name: 'Springfield Nuclear Power Plant',
          },
        })

        recipient = await prisma.recipient.create({
          data: {
            group_id: group.id,
            display_name: 'Homer Jay Simpson',
            wallet_address: '0xDEADBEEF',
          },
        })
      })

      describe('when required fields are missing', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            {},
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          const result = parseJSON(res)

          expect(result.success).toBeFalse()
          expect(result.validation_errors).toHaveLength(2)
          expect(result.validation_errors).toIncludeAllMembers([
            'Transaction hash: Required',
            'Amount: Required',
          ])
        })
      })

      describe('when transaction_hash is not a string', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { transaction_hash: 1, amount: 1 },
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
            { id: group.id, recipient_id: recipient.id },
            { transaction_hash: ' ', amount: 1 },
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
            { id: group.id, recipient_id: recipient.id },
            { transaction_hash: ' 1 ', amount: 1 },
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

      describe('when amount is not a number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { transaction_hash: '123', amount: '1' },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Amount: Expected number, received string'],
          })
        })
      })

      describe('when amount is a negative number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { transaction_hash: '123', amount: -1 },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Amount: Number must be greater than 0'],
          })
        })
      })

      describe('when amount is zero', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { transaction_hash: '123', amount: 0 },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Amount: Number must be greater than 0'],
          })
        })
      })

      describe('when amount is a float number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequestWithQuery(
            { id: group.id, recipient_id: recipient.id },
            { transaction_hash: '123', amount: 0.01 },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Amount: Expected integer, received float'],
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
            display_name: 'Springfield Nuclear Power Plant',
          },
        })

        recipient = await prisma.recipient.create({
          data: {
            group_id: group.id,
            display_name: 'Homer Jay Simpson',
            wallet_address: '0xDEADBEEF',
          },
        })
      })

      it('returns valid response', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          { id: group.id, recipient_id: recipient.id },
          { transaction_hash: '123', amount: 42 },
          sessionToken
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(201)

        const response = parseJSON(res)
        expect(response.success).toBeTruthy()
        expect(response.data).not.toBeEmptyObject()
        expect(response.data.id).not.toBeEmpty()
        expect(response.data.recipient_id).toEqual(recipient.id)
        expect(response.data.wallet_address).toEqual('0xDEADBEEF')
        expect(response.data.transaction_hash).toEqual('123')
        expect(response.data.amount).toEqual(42)
        expect(response.data.created_at).not.toBeEmpty()
      })
    })
  })
})
