import { jest } from '@jest/globals'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import request from 'supertest'
import app from '../src/app'

type PostedPayload = {
  data: Array<{
    user_data: Record<string, unknown>
  }>
}

describe('POST /api/meta/events', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('enriches user context and forwards the payload', async () => {
    const axiosResponse: Partial<AxiosResponse> = {
      data: { events_received: 1 },
    }
    const spy = jest.spyOn(axios, 'post').mockResolvedValue(axiosResponse as AxiosResponse)

    const response = await request(app)
      .post('/api/meta/events')
      .set('User-Agent', 'TestSuite/1.0')
      .set('X-Forwarded-For', '203.0.113.1')
      .send({
        eventName: 'PageView',
        eventSourceUrl: 'https://plany.tn',
        userData: {
          email: 'user@test.com',
        },
      })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(spy).toHaveBeenCalledTimes(1)

    const [, payload] = spy.mock.calls[0] as [string, PostedPayload]
    const [event] = payload.data

    expect(event.user_data.client_ip_address).toBe('203.0.113.1')
    expect(event.user_data.client_user_agent).toBe('TestSuite/1.0')
  })

  it('returns 400 for invalid requests', async () => {
    const spy = jest.spyOn(axios, 'post').mockResolvedValue({} as AxiosResponse)

    const response = await request(app)
      .post('/api/meta/events')
      .send({
        eventName: 'Purchase',
        userData: { email: 'user@test.com' },
      })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(spy).not.toHaveBeenCalled()
  })
})
