import { prisma } from '@/lib/prisma'
import handler from '@/pages/api/companies'
import { mockGETRequest, parseJSON, cleanDatabase } from '../../../helpers'
import type { Company } from '@prisma/client'

const ENDPOINT = '/api/companies'

beforeEach(async () => {
  await cleanDatabase(prisma)
})

describe(`GET ${ENDPOINT}`, () => {
  it('returns an empty array when there are no companies in the database', async () => {
    const { req, res } = mockGETRequest()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(parseJSON(res)).toEqual({ success: true, data: [] })
  })

  it('returns an array of companies with all attributes when there are companies in the database', async () => {
    const company1: Company = await prisma.company.create({
      data: {
        display_name: 'Company 1',
        comment: 'Comment 1',
      },
    })

    const company2: Company = await prisma.company.create({
      data: {
        display_name: 'Company 2',
        comment: 'Comment 2',
      },
    })

    const { req, res } = mockGETRequest()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(parseJSON(res)).toEqual({
      success: true,
      data: [
        {
          id: company1.id,
          display_name: 'Company 1',
          comment: 'Comment 1',
          created_at: company1.created_at.toISOString(),
          updated_at: company1.updated_at.toISOString(),
          archived_at: null,
        },
        {
          id: company2.id,
          display_name: 'Company 2',
          comment: 'Comment 2',
          created_at: company2.created_at.toISOString(),
          updated_at: company2.updated_at.toISOString(),
          archived_at: null,
        },
      ],
    })
  })
})
