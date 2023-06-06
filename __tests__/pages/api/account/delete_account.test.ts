import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/account'
import {
  mockDELETERequest,
  parseJSON,
  cleanDatabase,
  createUserWithSession,
} from '../../../helpers'

const ENDPOINT = '/api/account'

describe(`DELETE ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('authorization errors', () => {
    describe('when session is not provided', () => {
      it('returns error', async () => {
        const { req, res } = mockDELETERequest()

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

        const { req, res } = mockDELETERequest(sessionToken)

        await handler(req, res)

        expect(res._getStatusCode()).toBe(401)

        const response = parseJSON(res)
        expect(response.success).toBeFalse()
        expect(response.message).toEqual('Authorization required')
      })
    })
  })

  describe('when authorized', () => {
    let userId: string, anotherUserId: string, sessionToken: string

    beforeEach(async () => {
      const { userId: _userId, sessionToken: _sessionToken } =
        await createUserWithSession()

      const { userId: _user2Id } = await createUserWithSession()

      userId = _userId
      sessionToken = _sessionToken
      anotherUserId = _user2Id
    })

    it('removes user with all data', async () => {
      const group = await prisma.group.create({
        data: {
          userId: userId,
          displayName: 'Springfield Nuclear Power Plant (Workers)',
          comment: 'Workers',
        },
      })

      const anotherGroup = await prisma.group.create({
        data: {
          userId: anotherUserId,
          displayName: 'Springfield Nuclear Power Plant (Staff)',
        },
      })

      const firstRecipient = await prisma.recipient.create({
        data: {
          groupId: group.id,
          displayName: 'Homer Jay Simpson',
          comment: 'Technical supervisor',
          walletAddress: '0xDEADBEEF',
        },
      })

      const secondRecipient = await prisma.recipient.create({
        data: {
          groupId: group.id,
          displayName: 'Lenny Leonard',
          walletAddress: '0xBEE',
          salary: 42,
          archivedAt: new Date(),
        },
      })

      const anotherRecipient = await prisma.recipient.create({
        data: {
          groupId: anotherGroup.id,
          displayName: 'Montgomery Burns',
          walletAddress: '0xBEER',
        },
      })

      await prisma.payment.create({
        data: {
          recipientId: firstRecipient.id,
          transactionHash: '0xHASH',
          walletAddress: '0xDEADBEEF',
          amount: 35,
        },
      })

      await prisma.payment.create({
        data: {
          recipientId: secondRecipient.id,
          transactionHash: '0xHASH2',
          walletAddress: '0xBEE',
          amount: 42,
        },
      })

      const anotherRecipientPayment = await prisma.payment.create({
        data: {
          recipientId: anotherRecipient.id,
          transactionHash: '0xHASH3',
          walletAddress: '0xBEEA',
          amount: 43,
        },
      })

      const { req, res } = mockDELETERequest(sessionToken)

      await handler(req, res)

      const users = await prisma.user.findMany()
      expect(users).toHaveLength(1)
      expect(users[0].id).toEqual(anotherUserId)

      const groups = await prisma.group.findMany()
      expect(groups).toHaveLength(1)
      expect(groups[0].id).toEqual(anotherGroup.id)

      const recipients = await prisma.recipient.findMany()
      expect(recipients).toHaveLength(1)
      expect(recipients[0].id).toEqual(anotherRecipient.id)

      const payments = await prisma.payment.findMany()
      expect(payments).toHaveLength(1)
      expect(payments[0].id).toEqual(anotherRecipientPayment.id)
    })

    it('returns user data', async () => {
      const { req, res } = mockDELETERequest(sessionToken)

      await handler(req, res)

      expect(res.statusCode).toBe(200)
      expect(parseJSON(res)).toEqual({
        success: true,
        data: {
          id: userId,
          name: null,
          email: `${sessionToken}@domain.tld`,
          created_at: expect.toBeDateString(),
          updated_at: expect.toBeDateString(),
        },
      })
    })
  })
})
