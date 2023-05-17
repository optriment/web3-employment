import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/groups'
import { mockGETRequest, parseJSON, cleanDatabase } from '../../../helpers'

const ENDPOINT = '/api/groups'

beforeEach(async () => {
  await cleanDatabase(prisma)
})

describe(`GET ${ENDPOINT}`, () => {
  it('returns an empty array when there are no groups in the database', async () => {
    const { req, res } = mockGETRequest()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(parseJSON(res)).toEqual({ success: true, data: [] })
  })

  it('returns an array of groups with all attributes when there are groups in the database', async () => {
    const group1 = await prisma.group.create({
      data: {
        display_name: 'Springfield Nuclear Power Plant (Workers)',
        comment: 'Workers',
      },
    })

    const group2 = await prisma.group.create({
      data: {
        display_name: 'Springfield Nuclear Power Plant (Staff)',
        comment: 'Staff',
      },
    })

    const { req, res } = mockGETRequest()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(parseJSON(res)).toEqual({
      success: true,
      data: [
        {
          id: group1.id,
          display_name: 'Springfield Nuclear Power Plant (Workers)',
          comment: 'Workers',
          created_at: group1.created_at.toISOString(),
          updated_at: group1.updated_at.toISOString(),
          archived_at: null,
        },
        {
          id: group2.id,
          display_name: 'Springfield Nuclear Power Plant (Staff)',
          comment: 'Staff',
          created_at: group2.created_at.toISOString(),
          updated_at: group2.updated_at.toISOString(),
          archived_at: null,
        },
      ],
    })
  })
})
