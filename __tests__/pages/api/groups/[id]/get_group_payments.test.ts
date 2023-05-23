import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]/payments'
import {
  cleanDatabase,
  mockGETRequestWithQuery,
  parseJSON,
  createUserWithSession,
} from '../../../../helpers'
import type { Group, Recipient, Payment } from '@prisma/client'

const ENDPOINT = '/api/groups/[id]/payments'

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
        it('returns a specific group and empty recipients and payments arrays', async () => {
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
          expect(result.data.payments).toBeEmpty()
        })
      })

      describe('when there are recipients', () => {
        let firstRecipient: Recipient,
          secondRecipient: Recipient,
          anotherRecipient: Recipient

        beforeEach(async () => {
          firstRecipient = await prisma.recipient.create({
            data: {
              group_id: group.id,
              display_name: 'Homer Jay Simpson',
              comment: 'Technical supervisor',
              wallet_address: '0xDEADBEEF',
            },
          })

          secondRecipient = await prisma.recipient.create({
            data: {
              group_id: group.id,
              display_name: 'Lenny Leonard',
              wallet_address: '0xBEE',
              salary: 42,
              archived_at: new Date(),
            },
          })

          anotherRecipient = await prisma.recipient.create({
            data: {
              group_id: anotherGroup.id,
              display_name: 'Montgomery Burns',
              wallet_address: '0xBEER',
            },
          })
        })

        describe('when there are no payments', () => {
          it('returns a specific group, assigned recipients to it, and empty payments', async () => {
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

        describe('when there are payments', () => {
          let firstRecipientPayment1: Payment,
            firstRecipientPayment2: Payment,
            secondRecipientPayment: Payment

          beforeEach(async () => {
            firstRecipientPayment1 = await prisma.payment.create({
              data: {
                recipient_id: firstRecipient.id,
                transaction_hash: '0xHASH1',
                wallet_address: '0xDEADBEEF',
                amount: 35,
              },
            })

            secondRecipientPayment = await prisma.payment.create({
              data: {
                recipient_id: secondRecipient.id,
                transaction_hash: '0xHASH2',
                wallet_address: '0xBEE',
                amount: 42,
              },
            })

            firstRecipientPayment2 = await prisma.payment.create({
              data: {
                recipient_id: firstRecipient.id,
                transaction_hash: '0xHASH3',
                wallet_address: '0xDEADBEEF',
                amount: 1,
              },
            })

            await prisma.payment.create({
              data: {
                recipient_id: anotherRecipient.id,
                transaction_hash: '0xHASH4',
                wallet_address: '0xBEER',
                amount: 99,
              },
            })
          })

          it('returns a specific group, assigned recipients to it, and recipients payments', async () => {
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

            expect(result.data.payments).toHaveLength(3)

            expect(result.data.payments[0].id).toEqual(
              firstRecipientPayment2.id
            )
            expect(result.data.payments[0].transaction_hash).toEqual('0xHASH3')
            expect(result.data.payments[0].wallet_address).toEqual('0xDEADBEEF')
            expect(result.data.payments[0].amount).toEqual(1)
            expect(result.data.payments[0].recipient_id).toEqual(
              firstRecipient.id
            )
            expect(result.data.payments[0].created_at).not.toBeEmpty()

            expect(result.data.payments[1].id).toEqual(
              secondRecipientPayment.id
            )
            expect(result.data.payments[1].transaction_hash).toEqual('0xHASH2')
            expect(result.data.payments[1].wallet_address).toEqual('0xBEE')
            expect(result.data.payments[1].amount).toEqual(42)
            expect(result.data.payments[1].recipient_id).toEqual(
              secondRecipient.id
            )
            expect(result.data.payments[1].created_at).not.toBeEmpty()

            expect(result.data.payments[2].id).toEqual(
              firstRecipientPayment1.id
            )
            expect(result.data.payments[2].transaction_hash).toEqual('0xHASH1')
            expect(result.data.payments[2].wallet_address).toEqual('0xDEADBEEF')
            expect(result.data.payments[2].amount).toEqual(35)
            expect(result.data.payments[2].recipient_id).toEqual(
              firstRecipient.id
            )
            expect(result.data.payments[2].created_at).not.toBeEmpty()
          })
        })
      })
    })
  })
})
