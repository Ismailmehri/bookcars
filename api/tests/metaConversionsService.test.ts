import { jest } from '@jest/globals'
import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { sendMetaEvent, MetaConversionsError } from '../src/services/metaConversionsService'
import { hashEmail, hashName } from '../src/utils/hash'

type PostedPayload = {
  data: Array<{
    event_name: string
    user_data: Record<string, unknown>
    custom_data?: Record<string, unknown>
    attribution_data?: Record<string, unknown>
    original_event_data?: Record<string, unknown>
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

  it('hashes sensitive fields and forwards purchase events with extended metadata', async () => {
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
        firstName: 'John',
        lastName: 'Doe',
        externalId: ' user-42 ',
        fbp: 'fb.1.123',
        fbc: 'fb.1.456',
      },
      customData: {
        value: 150.126,
        currency: 'tnd',
        orderId: ' order-99 ',
        transactionId: 'txn-123',
        contents: [
          { id: 'car_1234', quantity: 2, price: 75.055, title: 'Economy', category: 'Car ' },
        ],
        coupon: 'summer',
        pageLocation: 'https://plany.tn/reservation/123',
        pageTitle: 'Checkout',
        isAuthenticated: true,
      },
      content: {
        ids: ['car_1234'],
        type: 'car',
      },
      attributionData: { attributionShare: '0.3', adId: 'AD123' },
      originalEventData: { eventName: 'Purchase', eventTime: 1763200322 },
      testEventCode: 'TEST123',
    })

    expect(response).toEqual({ events_received: 1, fbtrace_id: 'trace' })
    expect(spy).toHaveBeenCalledTimes(1)

    const [, payload, config] = spy.mock.calls[0] as [string, PostedPayload, AxiosConfig]
    const [event] = payload.data

    expect(config?.params?.access_token).toBe('TEST_PIXEL_TOKEN')
    expect(event.event_name).toBe('Purchase')
    expect(event.custom_data?.currency).toBe('TND')
    expect(event.custom_data?.value).toBe(150.13)
    expect(event.custom_data?.content_ids).toEqual(['car_1234'])
    expect(event.custom_data?.contents).toEqual([
      expect.objectContaining({
        id: 'car_1234',
        quantity: 2,
        item_price: 75.06,
        price: 75.06,
        title: 'Economy',
        category: 'Car',
      }),
    ])
    expect(event.custom_data?.coupon).toBe('summer')
    expect(event.custom_data?.page_location).toBe('https://plany.tn/reservation/123')
    expect(event.custom_data?.page_title).toBe('Checkout')
    expect(event.custom_data?.transaction_id).toBe('txn-123')
    expect(event.custom_data?.order_id).toBe('order-99')
    expect(event.custom_data?.is_authenticated).toBe(true)
    expect(event.user_data.em).toEqual([hashEmail('Customer@Test.com ')])
    expect(event.user_data.client_user_agent).toBe('Mozilla/5.0')
    expect(event.user_data.fn).toEqual([hashName('John')])
    expect(event.user_data.ln).toEqual([hashName('Doe')])
    expect(event.user_data.external_id).toEqual(['user-42'])
    expect(event.user_data.client_fbc).toBe('fb.1.456')
    expect(event.attribution_data?.attribution_share).toBe('0.3')
    expect(event.attribution_data?.ad_id).toBe('AD123')
    expect(event.original_event_data?.event_name).toBe('Purchase')
    expect(event.original_event_data?.event_time).toBe(1763200322)
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

  it('forwards search events with additional metadata', async () => {
    const axiosResponse: Partial<AxiosResponse> = {
      data: { events_received: 1 },
    }
    const spy = jest.spyOn(axios, 'post').mockResolvedValue(axiosResponse as AxiosResponse)

    const response = await sendMetaEvent({
      eventName: 'Search',
      eventSourceUrl: 'https://plany.tn/search',
      userData: { userAgent: 'TestSuite/1.0' },
      customData: {
        searchString: 'Tunis Airport',
        searchTerm: 'tunis airport',
        sameLocation: false,
        filters: { ranges: ['mini'], transmission: 'auto' },
      },
    })

    expect(response.events_received).toBe(1)
    const [, payload] = spy.mock.calls[0] as [string, PostedPayload]
    const [event] = payload.data

    expect(event.event_name).toBe('Search')
    expect(event.custom_data?.search_string).toBe('Tunis Airport')
    expect(event.custom_data?.search_term).toBe('tunis airport')
    expect(event.custom_data?.same_location).toBe(false)
    expect(event.custom_data?.filters).toEqual({ ranges: ['mini'], transmission: 'auto' })
  })

  it('rejects lead events without contact information', async () => {
    await expect(
      sendMetaEvent({
        eventName: 'Lead',
        eventSourceUrl: 'https://plany.tn/contact',
        userData: { userAgent: 'TestSuite/1.0' },
        customData: { leadSource: 'contact-form' },
      }),
    ).rejects.toThrow(MetaConversionsError)
  })
})
