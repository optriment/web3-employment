import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]/recipients'
import {
  cleanDatabase,
  mockPOSTRequestWithQuery,
  parseJSON,
} from '../../../../../helpers'
import type { Group } from '@prisma/client'

const ENDPOINT = '/api/groups/[id]/recipients'

beforeEach(async () => {
  await cleanDatabase(prisma)
})

describe(`POST ${ENDPOINT}`, () => {
  describe('general errors', () => {
    describe('when group_id is not a valid UUID', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery({ id: 'qwe' }, {})

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

        const { req, res } = mockPOSTRequestWithQuery({ id: groupId }, {})

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
          display_name: 'Springfield Nuclear Power Plant',
        },
      })
    })

    describe('when display_name is missing', () => {
      it('returns error', async () => {
        const { req, res } = mockPOSTRequestWithQuery({ id: group.id }, {})

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
          }
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
        const { req, res } = mockPOSTRequestWithQuery(
          {
            id: group.id,
          },
          {
            display_name: ' ',
          }
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
          }
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
        const { req, res } = mockPOSTRequestWithQuery(
          {
            id: group.id,
          },
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
        const { req, res } = mockPOSTRequestWithQuery(
          {
            id: group.id,
          },
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
    let group: Group

    beforeEach(async () => {
      group = await prisma.group.create({
        data: {
          display_name: 'Springfield Nuclear Power Plant',
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
          }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(201)

        const response = parseJSON(res)
        expect(response.success).toBeTruthy()
        expect(response.data).not.toBeEmptyObject()
        expect(response.data.id).not.toBeEmpty()
        expect(response.data.display_name).toEqual('Homer Jay Simpson')
        expect(response.data.comment).toBeNull()
        expect(response.data.wallet_address).toBeNull()
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
            wallet_address: ' 0xDEADBEEF ',
            contacts: ' Homer_Simpson@AOL.com ',
            salary: 42,
          }
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(201)

        const response = parseJSON(res)
        expect(response.success).toBeTruthy()
        expect(response.data).not.toBeEmptyObject()
        expect(response.data.id).not.toBeEmpty()
        expect(response.data.display_name).toEqual('Homer Jay Simpson')
        expect(response.data.comment).toEqual('Technical supervisor')
        expect(response.data.wallet_address).toEqual('0xDEADBEEF')
        expect(response.data.contacts).toEqual('Homer_Simpson@AOL.com')
        expect(response.data.salary).toEqual(42)
        expect(response.data.created_at).not.toBeEmpty()
        expect(response.data.updated_at).not.toBeEmpty()
        expect(response.data.archived_at).toBeNull()
      })
    })
  })
})
