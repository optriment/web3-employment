import fs from 'fs'
import path from 'path'
import cookieParser from 'cookie-parser'
import express from 'express'
import request from 'supertest'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import { default as handler } from '@/pages/api/groups/[id]/import'
import {
  cleanDatabase,
  mockPOSTRequestWithQuery,
  parseJSON,
  createUserWithSession,
} from '../../../../../helpers'
import type { Group } from '@prisma/client'

const ENDPOINT = '/api/groups/[id]/import'

describe(`POST ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  describe('authorization errors', () => {
    describe('when session is not provided', () => {
      it('returns error', async () => {
        const groupId = uuidv4()

        const { req, res } = mockPOSTRequestWithQuery({ id: groupId })

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

        const { req, res } = mockPOSTRequestWithQuery(
          { id: groupId },
          {},
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
      it('returns error ', async () => {
        const { req, res } = mockPOSTRequestWithQuery(
          { id: 'invalid-id' },
          {},
          sessionToken
        )

        await handler(req, res)

        expect(res._getStatusCode()).toBe(500)
        expect(parseJSON(res)).toEqual({
          success: false,
          message: 'Invalid UUID',
        })
      })
    })

    describe('when group does not exist', () => {
      it('returns error', async () => {
        const groupId = uuidv4()

        const { req, res } = mockPOSTRequestWithQuery(
          { id: groupId },
          {},
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

    describe('when a group is active', () => {
      let group: Group

      beforeEach(async () => {
        group = await prisma.group.create({
          data: {
            userId: userId,
            displayName: 'Springfield Nuclear Power Plant',
            comment: 'Workers',
          },
        })
      })

      describe('when file is provided', () => {
        ;[
          'recipients-semicolons-separated.csv',
          'recipients-comma-separated.csv',
        ].forEach((filename) => {
          describe(`with ${filename}`, () => {
            it('imports recipients', async () => {
              const app = express()

              app.use(cookieParser())

              app.post(`/api/groups/${group.id}/import`, handler)

              const testFilePath = path.join(__dirname, filename)
              const fileStream = fs.createReadStream(testFilePath)

              const response = await request(app)
                .post(`/api/groups/${group.id}/import`)
                .query({ id: group.id })
                .set('Cookie', `next-auth.session-token=${sessionToken}`)
                .attach('csv', fileStream)

              expect(response.status).toBe(201)
              expect(response.body.data).toHaveLength(3)

              const recipients = await prisma.recipient.findMany({
                where: {
                  groupId: group.id,
                },
              })

              expect(recipients).toHaveLength(3)

              const firstRecipient = recipients.find(
                (recipient) =>
                  recipient.walletAddress ===
                  'TF6kbCK9sWFHJ8AWu74czrgReUCEQtHgkZ'
              )

              expect(firstRecipient.displayName).toEqual('name1')
              expect(firstRecipient.comment).toEqual('comment1')
              expect(firstRecipient.salary.toString()).toEqual('123456000001')
              expect(firstRecipient.contacts).toEqual('contacts1')

              const secondRecipient = recipients.find(
                (recipient) =>
                  recipient.walletAddress ===
                  'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
              )

              expect(secondRecipient.displayName).toEqual('name2')
              expect(secondRecipient.comment).toEqual('comment2')
              expect(secondRecipient.salary.toString()).toEqual('0')
              expect(secondRecipient.contacts).toEqual('contacts2')

              const thirdRecipient = recipients.find(
                (recipient) =>
                  recipient.walletAddress ===
                  'TGCXHg6VbCtKmYwSXL3fEyJDv7wxvnfKhB'
              )

              expect(thirdRecipient.displayName).toEqual(
                'TGCXHg6VbCtKmYwSXL3fEyJDv7wxvnfKhB'
              )
              expect(thirdRecipient.comment).toEqual('')
              expect(thirdRecipient.salary.toString()).toEqual('0')
              expect(thirdRecipient.contacts).toEqual('')
            })
          })
        })
      })
    })
  })
})
