import { jest } from '@jest/globals'
import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { sendMetaEvent, MetaConversionsError } from '../src/services/metaConversionsService'
import { hashEmail } from '../src/utils/hash'

type PostedPayload = {
  data: Array<{
    event_name: string
    user_data: Record<string, unknown>
    custom_data?: Record<string, unknown>
  }>
  test_event_code?: string
}

type AxiosConfig = {
  params?: {
    access_token?: string
  }
}

describe('Meta Conversions service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('hashes sensitive fields and forwards purchase events', async () => {
    const axiosResponse: Partial<AxiosResponse> = {
      data: { events_received: 1, fbtrace_id: 'trace' },
    }
    const spy = jest.spyOn(axios, 'post').mockResolvedValue(axiosResponse as AxiosResponse)

    const response = await sendMetaEvent({
      eventName: 'Purchase',
      eventSourceUrl: 'https://plany.tn/reservation/123',
      userData: {
        email: 'Customer@Test.com ',
        phone: '+216 55 555 555',
        ip: '102.16.22.11',
        userAgent: 'Mozilla/5.0',
      },
      customData: {
        value: 150,
        currency: 'tnd',
      },
      content: {
        ids: ['car_1234'],
        type: 'car',
      },
      testEventCode: 'TEST123',
    })

    expect(response).toEqual({ events_received: 1, fbtrace_id: 'trace' })
    expect(spy).toHaveBeenCalledTimes(1)

    const [, payload, config] = spy.mock.calls[0] as [string, PostedPayload, AxiosConfig]
    const [event] = payload.data

    expect(config?.params?.access_token).toBe('TEST_PIXEL_TOKEN')
    expect(event.event_name).toBe('Purchase')
    expect(event.custom_data?.currency).toBe('TND')
    expect(event.custom_data?.content_ids).toEqual(['car_1234'])
    expect(event.user_data.em).toBe(hashEmail('Customer@Test.com '))
    expect(event.user_data.client_user_agent).toBe('Mozilla/5.0')
    expect(payload.test_event_code).toBe('TEST123')
  })

  it('throws a descriptive error when required fields are missing', async () => {
    await expect(sendMetaEvent({
      eventName: 'Purchase',
      eventSourceUrl: 'https://plany.tn/reservation',
      userData: {
        email: 'customer@test.com',
        userAgent: 'Mozilla/5.0',
      },
      customData: {
        currency: 'TND',
      },
    })).rejects.toThrow(MetaConversionsError)
  })

  it('validates AddToCart content requirements', async () => {
    await expect(sendMetaEvent({
      eventName: 'AddToCart',
      eventSourceUrl: 'https://plany.tn/cart',
      userData: {
        email: 'customer@test.com',
        userAgent: 'Mozilla/5.0',
      },
    })).rejects.toThrow(MetaConversionsError)
  })
})
