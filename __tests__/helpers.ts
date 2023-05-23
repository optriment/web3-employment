import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { createMocks } from 'node-mocks-http'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import type { PrismaClient } from '@prisma/client'
import type { RequestOptions, MockResponse } from 'node-mocks-http'

export const cleanDatabase = async (prisma: PrismaClient) => {
  const deletePayments = prisma.payment.deleteMany()
  const deleteRecipients = prisma.recipient.deleteMany()
  const deleteGroups = prisma.group.deleteMany()
  const deleteUsers = prisma.user.deleteMany()

  await prisma.$transaction([
    deletePayments,
    deleteRecipients,
    deleteGroups,
    deleteUsers,
  ])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseJSON = (res: MockResponse<any>) => JSON.parse(res._getData())

export const mockPOSTRequest = (
  body: RequestOptions['body'] = {},
  sessionToken?: string
) =>
  createMocks({
    method: 'POST',
    body: body,
    cookies: {
      'next-auth.session-token': sessionToken || '',
    },
  })

export const mockPOSTRequestWithQuery = (
  query: RequestOptions['query'],
  body: RequestOptions['body'] = {},
  sessionToken?: string
) =>
  createMocks({
    method: 'POST',
    query: query,
    body: body,
    cookies: {
      'next-auth.session-token': sessionToken || '',
    },
  })

export const mockGETRequest = (sessionToken?: string) =>
  createMocks({
    method: 'GET',
    cookies: {
      'next-auth.session-token': sessionToken || '',
    },
  })

export const mockGETRequestWithQuery = (
  query: RequestOptions['query'],
  sessionToken?: string
) =>
  createMocks({
    method: 'GET',
    query: query,
    cookies: {
      'next-auth.session-token': sessionToken || '',
    },
  })

export const mockPUTRequestWithQuery = (
  query: RequestOptions['query'],
  body: RequestOptions['body'] = {},
  sessionToken?: string
) =>
  createMocks({
    method: 'PUT',
    query: query,
    body: body,
    cookies: {
      'next-auth.session-token': sessionToken || '',
    },
  })

export const mockDELETERequest = (
  query: RequestOptions['query'],
  sessionToken?: string
) =>
  createMocks({
    method: 'DELETE',
    query: query,
    cookies: {
      'next-auth.session-token': sessionToken || '',
    },
  })

interface UserIdAndSessionToken {
  userId: string
  sessionToken: string
}

export const createUserWithSession =
  async (): Promise<UserIdAndSessionToken> => {
    const sessionToken = uuidv4()

    const adapter = PrismaAdapter(prisma)

    const user = await adapter.createUser({
      email: `${sessionToken}@domain.tld`,
      emailVerified: new Date(),
    })

    await adapter.createSession({
      userId: user.id,
      sessionToken: sessionToken,
      expires: new Date('2100-01-01'),
    })

    return {
      userId: user.id,
      sessionToken,
    }
  }
