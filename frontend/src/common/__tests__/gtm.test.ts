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

vi.mock('react-gtm-module', () => ({
  default: {
    initialize: vi.fn(),
    dataLayer: vi.fn(),
  },
}))

const originalGtmId = env.GOOGLE_ANALYTICS_ID
const originalGaEnabled = env.GOOGLE_ANALYTICS_ENABLED
const originalStripeCurrency = env.STRIPE_CURRENCY_CODE
const originalDisplayCurrency = env.CURRENCY

const dataLayerMock = TagManager.dataLayer as unknown as vi.Mock

beforeEach(() => {
  vi.clearAllMocks()
  env.GOOGLE_ANALYTICS_ID = 'GTM-TEST'
  env.GOOGLE_ANALYTICS_ENABLED = true
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
  })

  it('sends lead events with metadata', () => {
    sendLeadEvent({
      source: 'contact-form',
      hasEmail: true,
      subject: 'Location longue durée',
      messageLength: 120,
      isAuthenticated: false,
    })

    expect(dataLayerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          event: 'Lead',
          lead_source: 'contact-form',
          has_email: true,
          message_length: 120,
        }),
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
  })
})
