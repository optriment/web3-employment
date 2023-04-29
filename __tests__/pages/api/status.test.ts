import { createMocks } from 'node-mocks-http'
import { METHOD_NOT_ALLOWED } from '@/lib/messages'
import handler from '@/pages/api/status'
import { mockGETRequest, parseJSON } from '../../helpers'
import type { RequestMethod } from 'node-mocks-http'

const ENDPOINT = '/api/status'

const ensureMethodNotAllowed = (method: RequestMethod, url: string) => {
  describe(`${method} ${url}`, () => {
    it('returns error', async () => {
      const { req, res } = createMocks({
        method: method,
      })

      await handler(req, res)

      expect(parseJSON(res)).toEqual({ success: false, ...METHOD_NOT_ALLOWED })
      expect(res._getStatusCode()).toBe(405)
    })
  })
}

ensureMethodNotAllowed('POST', ENDPOINT)
ensureMethodNotAllowed('PUT', ENDPOINT)
ensureMethodNotAllowed('DELETE', ENDPOINT)

describe(`GET ${ENDPOINT}`, () => {
  it('returns response', async () => {
    const { req, res } = mockGETRequest()

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(parseJSON(res)).toEqual({ success: true })
  })
})
