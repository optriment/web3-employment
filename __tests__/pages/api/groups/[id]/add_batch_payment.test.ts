import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]/batch_payment'
import {
  cleanDatabase,
  mockPOSTRequest,
  parseJSON,
  createUserWithSession,
} from '../../../../helpers'

const ENDPOINT = '/api/groups/[id]/batch_payment'

describe(`POST ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('authorization errors', () => {
    describe('when session is not provided', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequest({})

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

        const { req, res } = mockPOSTRequest({}, sessionToken)

        await handler(req, res)

        expect(res._getStatusCode()).toBe(401)

        const response = parseJSON(res)
        expect(response.success).toBeFalse()
        expect(response.message).toEqual('Authorization required')
      })
    })
  })

  describe('when authorized', () => {
    const recipientId = uuidv4()

    let sessionToken: string

    beforeEach(async () => {
      const { sessionToken: _sessionToken } = await createUserWithSession()

      sessionToken = _sessionToken
    })

    describe('validation errors', () => {
      describe('when required fields are missing', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequest({}, sessionToken)

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          const result = parseJSON(res)

          expect(result.success).toBeFalse()
          expect(result.validation_errors).toHaveLength(2)
          expect(result.validation_errors).toIncludeAllMembers([
            'Transaction hash: Required',
            'Recipients: Required',
          ])
        })
      })

      describe('when transaction_hash is not a string', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: 1,
              recipients: [
                {
                  recipient_id: recipientId,
                  payment_amount: 1,
                  wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
                },
              ],
            },
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
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: ' ',
              recipients: [
                {
                  recipient_id: recipientId,
                  payment_amount: 1,
                  wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
                },
              ],
            },
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
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: ' 1 ',
              recipients: [
                {
                  recipient_id: recipientId,
                  payment_amount: 1,
                  wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
                },
              ],
            },
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

      describe('when recipients is not an array', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: '123',
              recipients: {},
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Recipients: Expected array, received object'],
          })
        })
      })

      describe('when recipients array is empty', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: '123',
              recipients: [],
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Recipients: Array must contain at least 1 element(s)',
            ],
          })
        })
      })

      describe('when recipient_id is not a string', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: '123',
              recipients: [
                {
                  recipient_id: 1,
                  payment_amount: 1,
                  wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
                },
              ],
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Recipients: Expected string, received number'],
          })
        })
      })

      describe('when recipient_id is an empty string', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: '123',
              recipients: [
                {
                  recipient_id: ' ',
                  payment_amount: 1,
                  wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
                },
              ],
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Recipients: String must contain at least 2 character(s)',
            ],
          })
        })
      })

      describe('when recipient_id is too short', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: '123',
              recipients: [
                {
                  recipient_id: ' 1 ',
                  payment_amount: 1,
                  wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
                },
              ],
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: [
              'Recipients: String must contain at least 2 character(s)',
            ],
          })
        })
      })

      describe('when payment_amount is not a number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: '123',
              recipients: [
                {
                  recipient_id: recipientId,
                  payment_amount: '1,1',
                  wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
                },
              ],
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Recipients: Expected number, received nan'],
          })
        })
      })

      describe('when payment_amount is a negative number', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: '123',
              recipients: [
                {
                  recipient_id: recipientId,
                  payment_amount: -1,
                  wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
                },
              ],
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Recipients: Number must be greater than 0'],
          })
        })
      })

      describe('when payment_amount is zero', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: '123',
              recipients: [
                {
                  recipient_id: recipientId,
                  payment_amount: 0,
                  wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
                },
              ],
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Recipients: Number must be greater than 0'],
          })
        })
      })

      describe('when wallet_address is not a string', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: '123',
              recipients: [
                {
                  recipient_id: recipientId,
                  payment_amount: 1,
                  wallet_address: 1,
                },
              ],
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Recipients: Expected string, received number'],
          })
        })
      })

      describe('when wallet_address is not a valid address', () => {
        it('returns error', async () => {
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: '123',
              recipients: [
                {
                  recipient_id: recipientId,
                  payment_amount: 1,
                  wallet_address: '123',
                },
              ],
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(422)
          expect(parseJSON(res)).toEqual({
            success: false,
            validation_errors: ['Recipients: Invalid wallet address'],
          })
        })
      })
    })

    describe('when everything is good', () => {
      describe('when payment amount is an integer', () => {
        it('returns valid response', async () => {
          const { req, res } = mockPOSTRequest(
            {
              transaction_hash: '123',
              recipients: [
                {
                  recipient_id: recipientId,
                  payment_amount: 10000 * 10 ** 6, // 10K USDT
                  wallet_address: 'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ',
                },
              ],
            },
            sessionToken
          )

          await handler(req, res)

          expect(res._getStatusCode()).toBe(201)

          const response = parseJSON(res)

          expect(response.success).toBeTruthy()
          expect(response.data).not.toBeEmptyObject()
          expect(response.data.id).not.toBeEmpty()
          expect(response.data.transaction_hash).toEqual('123')
          expect(response.data.user_id).not.toBeEmpty()
          expect(response.data.created_at).not.toBeEmpty()

          const batchPayment = await prisma.batchPayment.findUnique({
            where: {
              id: response.data.id,
            },
            include: {
              batchRecipients: true,
            },
          })

          expect(batchPayment?.transactionHash).toEqual('123')
          expect(batchPayment?.batchRecipients).toHaveLength(1)
          expect(batchPayment?.batchRecipients[0].recipientId).toEqual(
            recipientId
          )
          expect(batchPayment?.batchRecipients[0].walletAddress).toEqual(
            'TCLJzGqHZFPYMCPAdEUJxGH1wXVkef8aHJ'
          )
          expect(batchPayment?.batchRecipients[0].amount).toEqual(
            BigInt('10000000000')
          )
        })
      })
    })
  })
})
