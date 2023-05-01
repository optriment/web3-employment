import { createMocks } from 'node-mocks-http'
import type { PrismaClient } from '@prisma/client'
import type { RequestOptions, MockResponse } from 'node-mocks-http'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const cleanDatabase = async (_prisma: PrismaClient) => {
  // NOTE: Put here your cleanup instructions
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseJSON = (res: MockResponse<any>) => JSON.parse(res._getData())

export const mockPOSTRequest = (body: RequestOptions['body'] = {}) =>
  createMocks({
    method: 'POST',
    body: body,
  })

export const mockGETRequest = () => createMocks({ method: 'GET' })

export const mockGETRequestWithQuery = (query: RequestOptions['query']) =>
  createMocks({ method: 'GET', query: query })
