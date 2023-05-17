import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]/recipients/[recipient_id]'
import {
  cleanDatabase,
  mockPUTRequestWithQuery,
  parseJSON,
} from '../../../../../../helpers'
import type { Company, Employee } from '@prisma/client'

const ENDPOINT = '/api/groups/[id]/recipients/[recipient_id]'

beforeEach(async () => {
  await cleanDatabase(prisma)
})

describe(`PUT ${ENDPOINT}`, () => {
  describe('general errors', () => {
    describe('when group_id is not a valid UUID', () => {
      it('returns error', async () => {
        const { req, res } = mockPUTRequestWithQuery({ id: 'qwe' }, {})

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

        const { req, res } = mockPUTRequestWithQuery({ id: groupId }, {})

        await handler(req, res)

        expect(res._getStatusCode()).toBe(404)
        expect(parseJSON(res)).toEqual({
          success: false,
          message: `Group does not exist`,
        })
      })
    })

    describe('when group exists', () => {
      let group: Company

      beforeEach(async () => {
        group = await prisma.company.create({
          data: {
            display_name: 'Springfield Nuclear Power Plant',
          },
        })
      })

      describe('when recipient_id is not a valid UUID', () => {
        it('returns error', async () => {
          const { req, res } = mockPUTRequestWithQuery(
            { id: group.id, recipient_id: 'qwe' },
            {}
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
            {}
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
    let group: Company, recipient: Employee

    beforeEach(async () => {
      group = await prisma.company.create({
        data: {
          display_name: 'Springfield Nuclear Power Plant',
        },
      })

      recipient = await prisma.employee.create({
        data: {
          company_id: group.id,
          display_name: 'Homer Jay Simpson',
          wallet_address: '0xDEADBEEF',
        },
      })
    })

    describe('when display_name is missing', () => {
      it('returns error', async () => {
        const { req, res } = mockPUTRequestWithQuery(
          { id: group.id, recipient_id: recipient.id },
          {}
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
          { display_name: 1 }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(422)
        expect(parseJSON(res)).toEqual({
          success: false,
          validation_errors: ['Display name: Expected string, received number'],
        })
      })
    })

    describe('when display_name is an empty string', () => {
      it('returns error', async () => {
        const { req, res } = mockPUTRequestWithQuery(
          { id: group.id, recipient_id: recipient.id },
          { display_name: ' ' }
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
          { display_name: ' 1 ' }
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

    describe('when salary is a negative number', () => {
      it('returns error', async () => {
        const { req, res } = mockPUTRequestWithQuery(
          { id: group.id, recipient_id: recipient.id },
          {
            display_name: 'Homer Jay Simpson',
            salary: -1,
          }
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
        const { req, res } = mockPUTRequestWithQuery(
          { id: group.id, recipient_id: recipient.id },
          {
            display_name: 'Homer Jay Simpson',
            salary: 0.1,
          }
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
    let group: Company, recipient: Employee

    beforeEach(async () => {
      group = await prisma.company.create({
        data: {
          display_name: 'Springfield Nuclear Power Plant',
        },
      })

      recipient = await prisma.employee.create({
        data: {
          company_id: group.id,
          display_name: 'Homer Jay Simpson',
          comment: 'Technical supervisor',
          wallet_address: '0xDEADBEEF',
          contacts: 'Homer_Simpson@AOL.com',
          salary: 35,
        },
      })
    })

    describe('with only required fields', () => {
      it('returns valid response', async () => {
        const { req, res } = mockPUTRequestWithQuery(
          { id: group.id, recipient_id: recipient.id },
          {
            display_name: ' Bart ',
          }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(200)

        const response = parseJSON(res)
        expect(response.success).toBeTruthy()
        expect(response.data).not.toBeEmptyObject()
        expect(response.data.id).not.toBeEmpty()
        expect(response.data.display_name).toEqual('Bart')
        expect(response.data.comment).toEqual('Technical supervisor')
        expect(response.data.wallet_address).toEqual('0xDEADBEEF')
        expect(response.data.contacts).toEqual('Homer_Simpson@AOL.com')
        expect(response.data.salary).toEqual(35)
        expect(response.data.created_at).toEqual(
          recipient.created_at.toISOString()
        )
        expect(+Date.parse(response.data.updated_at)).toBeGreaterThan(
          +recipient.updated_at
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
            wallet_address: ' 0xBEE ',
            contacts: ' Bart@AOL.com ',
            salary: 42,
          }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(200)

        const response = parseJSON(res)
        expect(response.success).toBeTruthy()
        expect(response.data).not.toBeEmptyObject()
        expect(response.data.id).not.toBeEmpty()
        expect(response.data.display_name).toEqual('Bart Simpson')
        expect(response.data.comment).toEqual('Son')
        expect(response.data.wallet_address).toEqual('0xBEE')
        expect(response.data.contacts).toEqual('Bart@AOL.com')
        expect(response.data.salary).toEqual(42)
        expect(response.data.created_at).toEqual(
          recipient.created_at.toISOString()
        )
        expect(+Date.parse(response.data.updated_at)).toBeGreaterThan(
          +recipient.updated_at
        )
        expect(response.data.archived_at).toBeNull()
      })
    })
  })
})
