import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TagManager from 'react-gtm-module'
import env from '@/config/env.config'
import {
  getDefaultAnalyticsCurrency,
  pushEvent,
  sendCheckoutEvent,
  sendLeadEvent,
  sendPageviewEvent,
  sendPurchaseEvent,
  sendSearchEvent,
  sendViewContentEvent,
} from '@/common/gtm'
import { sendMetaEvent, getWindowLocationHref } from '@/services/MetaEventService'
import * as UserService from '@/services/UserService'

vi.mock('react-gtm-module', () => ({
  default: {
    initialize: vi.fn(),
    dataLayer: vi.fn(),
  },
}))

vi.mock('@/services/MetaEventService', () => ({
  sendMetaEvent: vi.fn().mockResolvedValue({ success: true }),
  getWindowLocationHref: vi.fn(() => 'https://plany.tn/checkout?lang=fr'),
}))

vi.mock('@/services/UserService', () => ({
  getCurrentUser: vi.fn(() => ({
    _id: 'user-1',
    email: 'user@test.com',
    phone: '+21655555555',
    fullName: 'John Doe',
    location: 'Tunis',
  })),
}))

const originalGtmId = env.GOOGLE_ANALYTICS_ID
const originalGaEnabled = env.GOOGLE_ANALYTICS_ENABLED
const originalStripeCurrency = env.STRIPE_CURRENCY_CODE
const originalDisplayCurrency = env.CURRENCY

const dataLayerMock = TagManager.dataLayer as unknown as vi.Mock
const sendMetaEventMock = sendMetaEvent as unknown as vi.Mock
const getCurrentUserMock = UserService.getCurrentUser as unknown as vi.Mock
const getWindowHrefMock = getWindowLocationHref as unknown as vi.Mock

beforeEach(() => {
  vi.clearAllMocks()
  env.GOOGLE_ANALYTICS_ID = 'GTM-TEST'
  env.GOOGLE_ANALYTICS_ENABLED = true
  sendMetaEventMock.mockClear()
  getCurrentUserMock.mockReturnValue({
    _id: 'user-1',
    email: 'user@test.com',
    phone: '+21655555555',
    fullName: 'John Doe',
    location: 'Tunis',
  })
  getWindowHrefMock.mockReturnValue('https://plany.tn/checkout?lang=fr')
})

afterEach(() => {
  env.GOOGLE_ANALYTICS_ID = originalGtmId
  env.GOOGLE_ANALYTICS_ENABLED = originalGaEnabled
  env.STRIPE_CURRENCY_CODE = originalStripeCurrency
  env.CURRENCY = originalDisplayCurrency
})

describe('getDefaultAnalyticsCurrency', () => {
  it('prefers the Stripe currency when available', () => {
    env.STRIPE_CURRENCY_CODE = 'eur'
    env.CURRENCY = 'tnd'

    expect(getDefaultAnalyticsCurrency()).toBe('EUR')
  })

  it('falls back to the display currency when Stripe currency is blank', () => {
    env.STRIPE_CURRENCY_CODE = ''
    env.CURRENCY = 'tnd'

    expect(getDefaultAnalyticsCurrency()).toBe('TND')
  })

  it('returns USD when no configuration is available', () => {
    env.STRIPE_CURRENCY_CODE = ''
    env.CURRENCY = ' '

    expect(getDefaultAnalyticsCurrency()).toBe('USD')
  })
})

describe('gtm events', () => {
  it('pushes events to the data layer when tracking ID is available', () => {
    pushEvent('TestEvent', { foo: 'bar' })

    expect(dataLayerMock).toHaveBeenCalledWith({
      dataLayer: {
        event: 'TestEvent',
        foo: 'bar',
      },
    })
  })

  it('skips data layer push when GTM ID is missing', () => {
    env.GOOGLE_ANALYTICS_ID = ''

    pushEvent('SkippedEvent', { value: 1 })

    expect(dataLayerMock).not.toHaveBeenCalled()
  })

  it('sends checkout events with normalized payloads', () => {
    sendCheckoutEvent({
      value: 100.459,
      currency: 'tnd',
      items: [
        { id: 'car-1', name: 'Economy Car', quantity: 2, price: 50.229 },
        { id: '', name: 'invalid', quantity: 1, price: 10 },
      ],
    })

    expect(dataLayerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          event: 'InitiateCheckout',
          value: 100.46,
          currency: 'TND',
          content_ids: ['car-1'],
          num_items: 2,
          items: [
            {
              id: 'car-1',
              name: 'Economy Car',
              quantity: 2,
              price: 50.23,
            },
          ],
        }),
      }),
    )

    expect(sendMetaEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'InitiateCheckout',
        customData: expect.objectContaining({
          value: 100.46,
          currency: 'TND',
          contentIds: ['car-1'],
          numItems: 2,
          isAuthenticated: true,
        }),
        userData: expect.objectContaining({ email: 'user@test.com' }),
      }),
    )
  })

  it('sends purchase events with transaction details', () => {
    sendPurchaseEvent({
      transactionId: 'booking-123',
      value: 200,
      currency: 'tnd',
      items: [
        { id: 'car-9', name: 'SUV', quantity: 1, price: 200 },
      ],
    })

    expect(dataLayerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          event: 'Purchase',
          transaction_id: 'booking-123',
        }),
      }),
    )

    expect(sendMetaEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'Purchase',
        customData: expect.objectContaining({
          orderId: 'booking-123',
          transactionId: 'booking-123',
          contentIds: ['car-9'],
          value: 200,
          currency: 'TND',
          isAuthenticated: true,
        }),
        userData: expect.objectContaining({ email: 'user@test.com' }),
      }),
    )
  })

  it('sends search events with filters and dates', () => {
    const start = new Date('2025-01-01T10:00:00.000Z')
    const end = new Date('2025-01-05T10:00:00.000Z')

    sendSearchEvent({
      searchTerm: 'Tunis Airport',
      pickupLocationId: 'pickup-1',
      dropOffLocationId: 'drop-2',
      startDate: start,
      endDate: end,
      sameLocation: false,
      filters: { ranges: ['mini'] },
    })

    expect(dataLayerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          event: 'Search',
          search_string: 'Tunis Airport',
          search_term: 'Tunis Airport',
          pickup_location_id: 'pickup-1',
          dropoff_location_id: 'drop-2',
          same_location: false,
          filters: { ranges: ['mini'] },
        }),
      }),
    )

    expect(sendMetaEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'Search',
        customData: expect.objectContaining({
          searchString: 'Tunis Airport',
          searchTerm: 'Tunis Airport',
          pickupLocationId: 'pickup-1',
          dropOffLocationId: 'drop-2',
          sameLocation: false,
          filters: { ranges: ['mini'] },
          isAuthenticated: true,
        }),
      }),
    )
  })

  it('tracks view content events for individual items', () => {
    sendViewContentEvent({
      id: 'car-1',
      name: 'Economy Car',
      price: 35,
      currency: 'tnd',
    })

    expect(dataLayerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          event: 'ViewContent',
          content_ids: ['car-1'],
          num_items: 1,
          contents: [
            expect.objectContaining({
              id: 'car-1',
              item_price: 35,
              quantity: 1,
            }),
          ],
        }),
      }),
    )

    expect(sendMetaEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'ViewContent',
        customData: expect.objectContaining({
          contentIds: ['car-1'],
          value: 35,
          currency: 'TND',
          numItems: 1,
          isAuthenticated: true,
        }),
      }),
    )
  })

  it('sends lead events with metadata', () => {
    env.STRIPE_CURRENCY_CODE = 'tnd'

    getCurrentUserMock.mockReturnValue(null)

    sendLeadEvent({
      source: 'contact-form',
      hasEmail: true,
      subject: 'Location longue durée',
      messageLength: 120,
      isAuthenticated: false,
      email: 'lead@test.com',
    })

    expect(dataLayerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          event: 'Lead',
          lead_source: 'contact-form',
          has_email: true,
          message_length: 120,
          value: 1,
          currency: 'TND',
        }),
      }),
    )

    expect(sendMetaEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'Lead',
        customData: expect.objectContaining({
          leadSource: 'contact-form',
          hasEmail: true,
          isAuthenticated: false,
        }),
        userData: expect.objectContaining({ email: 'lead@test.com' }),
      }),
    )
  })

  it('tracks page views', () => {
    sendPageviewEvent('/checkout', 'Checkout')

    expect(dataLayerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          event: 'PageView',
          page_url: '/checkout',
          page_location: '/checkout',
          page_title: 'Checkout',
        }),
      }),
    )

    expect(sendMetaEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'PageView',
        customData: expect.objectContaining({
          pageTitle: 'Checkout',
          isAuthenticated: true,
        }),
      }),
    )
  })
})
