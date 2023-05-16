import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups/[id]'
import {
  cleanDatabase,
  mockGETRequestWithQuery,
  parseJSON,
} from '../../../helpers'
import type { Company, Employee } from '@prisma/client'

const ENDPOINT = '/api/groups/[id]'

beforeEach(async () => {
  await cleanDatabase(prisma)
})

describe(`GET ${ENDPOINT}`, () => {
  describe('when group_id is not a valid UUID', () => {
    it('returns error', async () => {
      const { req, res } = mockGETRequestWithQuery({ id: 'qwe' })

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

      const { req, res } = mockGETRequestWithQuery({ id: groupId })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(404)
      expect(parseJSON(res)).toEqual({
        success: false,
        message: `Group does not exist`,
      })
    })
  })

  describe('when group exists', () => {
    let group: Company, anotherGroup: Company

    beforeEach(async () => {
      group = await prisma.company.create({
        data: {
          display_name: 'Springfield Nuclear Power Plant (Workers)',
          comment: 'Workers',
        },
      })

      anotherGroup = await prisma.company.create({
        data: {
          display_name: 'Springfield Nuclear Power Plant (Staff)',
        },
      })
    })

    describe('when there are no recipients', () => {
      it('returns a specific group and empty recipients array', async () => {
        const { req, res } = mockGETRequestWithQuery({ id: group.id })

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
      let firstRecipient: Employee, secondRecipient: Employee

      beforeEach(async () => {
        firstRecipient = await prisma.employee.create({
          data: {
            company_id: group.id,
            display_name: 'Homer Jay Simpson',
            comment: 'Technical supervisor',
          },
        })

        secondRecipient = await prisma.employee.create({
          data: {
            company_id: group.id,
            display_name: 'Lenny Leonard',
            salary: 42,
            archived_at: new Date(),
          },
        })

        await prisma.employee.create({
          data: {
            company_id: anotherGroup.id,
            display_name: 'Montgomery Burns',
          },
        })
      })

      it('returns a specific group and assigned recipients to it', async () => {
        const { req, res } = mockGETRequestWithQuery({ id: group.id })

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
        expect(result.data.recipients[1].display_name).toEqual('Lenny Leonard')
        expect(result.data.recipients[1].comment).toBeNull()
        expect(result.data.recipients[1].salary).toEqual(42)
        expect(result.data.recipients[1].archived_at).not.toBeNull()
      })
    })
  })
})
