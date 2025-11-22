import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const commonDist = path.join(distRoot, 'common')
const configDist = path.join(distRoot, 'config')
const nodeModulesDist = path.join(distRoot, 'node_modules')

const loadModule = async (filePath) => import(pathToFileURL(filePath))

const createStorageStub = () => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
})

globalThis.__TEST_IMPORT_META_ENV = {}

const envModule = await loadModule(path.join(configDist, 'env.config.js'))
const env = envModule.default

const tagManagerModule = await loadModule(path.join(nodeModulesDist, 'react-gtm-module/index.js'))
const gtm = await loadModule(path.join(commonDist, 'gtm.js'))

const originalGtmId = env.GOOGLE_ANALYTICS_ID
const originalGaEnabled = env.GOOGLE_ANALYTICS_ENABLED
const originalStripeCurrency = env.STRIPE_CURRENCY_CODE
const originalDisplayCurrency = env.CURRENCY

const dataLayerCalls = []

beforeEach(() => {
  dataLayerCalls.length = 0

  tagManagerModule.default.dataLayer = (payload) => {
    dataLayerCalls.push(payload)
  }

  env.GOOGLE_ANALYTICS_ID = 'GTM-TEST'
  env.GOOGLE_ANALYTICS_ENABLED = true
  env.STRIPE_CURRENCY_CODE = originalStripeCurrency
  env.CURRENCY = originalDisplayCurrency
  globalThis.localStorage = createStorageStub()
})

afterEach(() => {
  env.GOOGLE_ANALYTICS_ID = originalGtmId
  env.GOOGLE_ANALYTICS_ENABLED = originalGaEnabled
  env.STRIPE_CURRENCY_CODE = originalStripeCurrency
  env.CURRENCY = originalDisplayCurrency
  delete globalThis.localStorage
})

test('getDefaultAnalyticsCurrency prefers Stripe currency when set', () => {
  env.STRIPE_CURRENCY_CODE = 'eur'
  env.CURRENCY = 'tnd'

  assert.equal(gtm.getDefaultAnalyticsCurrency(), 'EUR')
})

test('getDefaultAnalyticsCurrency falls back to display currency when Stripe is empty', () => {
  env.STRIPE_CURRENCY_CODE = ''
  env.CURRENCY = 'tnd'

  assert.equal(gtm.getDefaultAnalyticsCurrency(), 'TND')
})

test('getDefaultAnalyticsCurrency returns USD when no configuration is available', () => {
  env.STRIPE_CURRENCY_CODE = ''
  env.CURRENCY = ' '

  assert.equal(gtm.getDefaultAnalyticsCurrency(), 'USD')
})

test('pushEvent pushes data when tracking ID exists', async () => {
  await gtm.pushEvent('TestEvent', { foo: 'bar' })
  await new Promise((resolve) => setImmediate(resolve))

  assert.equal(dataLayerCalls.length, 1)
  assert.deepEqual(dataLayerCalls[0], {
    dataLayer: {
      event: 'TestEvent',
      foo: 'bar',
    },
  })
})

test('pushEvent skips when tracking ID missing', () => {
  env.GOOGLE_ANALYTICS_ID = ''
  dataLayerCalls.length = 0

  gtm.pushEvent('SkippedEvent', { value: 1 })

  assert.equal(dataLayerCalls.length, 0)
})

test('sendCheckoutEvent normalizes payload before pushing to data layer', async () => {
  await gtm.sendCheckoutEvent({
    value: 100.459,
    currency: 'tnd',
    items: [
      { id: 'car-1', name: 'Economy', quantity: 2, price: 50.229 },
      { id: '', name: 'Invalid', quantity: 1, price: 10 },
    ],
  })

  assert.equal(dataLayerCalls.length, 1)
  const payload = dataLayerCalls[0].dataLayer
  assert.equal(payload.event, 'InitiateCheckout')
  assert.deepEqual(payload.items, [
    {
      id: 'car-1',
      name: 'Economy',
      quantity: 2,
      price: 50.23,
    },
  ])

  assert.equal(payload.num_items, 2)
  assert.equal(payload.currency, 'TND')
  assert.deepEqual(payload.content_ids, ['car-1'])
  assert.match(payload.event_id, /^plany-/)
})

test('sendPurchaseEvent sends transaction metadata', async () => {
  await gtm.sendPurchaseEvent({
    transactionId: 'booking-123',
    value: 200,
    currency: 'tnd',
    items: [
      { id: 'car-9', name: 'SUV', quantity: 1, price: 200 },
    ],
  })

  assert.equal(dataLayerCalls[0].dataLayer.transaction_id, 'booking-123')
  assert.equal(dataLayerCalls[0].dataLayer.num_items, 1)
  assert.equal(dataLayerCalls[0].dataLayer.currency, 'TND')
  assert.match(dataLayerCalls[0].dataLayer.event_id, /^plany-/)
})

test('sendSearchEvent forwards filters and dates', async () => {
  const start = new Date('2025-01-01T10:00:00.000Z')
  const end = new Date('2025-01-05T10:00:00.000Z')

  await gtm.sendSearchEvent({
    searchTerm: 'Tunis Airport',
    pickupLocationId: 'pickup-1',
    dropOffLocationId: 'drop-2',
    startDate: start,
    endDate: end,
    sameLocation: false,
    filters: { ranges: ['mini'] },
  })

  assert.equal(dataLayerCalls[0].dataLayer.filters.ranges[0], 'mini')
  assert.equal(dataLayerCalls[0].dataLayer.search_string, 'Tunis Airport')
  assert.equal(dataLayerCalls[0].dataLayer.pickup_location_id, 'pickup-1')
  assert.equal(dataLayerCalls[0].dataLayer.dropoff_location_id, 'drop-2')
  assert.equal(dataLayerCalls[0].dataLayer.same_location, false)
  assert.match(dataLayerCalls[0].dataLayer.event_id, /^plany-/)
})

test('sendViewContentEvent tracks item details', async () => {
  await gtm.sendViewContentEvent({
    id: 'car-3',
    name: 'Compact',
    price: 35,
    currency: 'tnd',
  })

  const payload = dataLayerCalls[0].dataLayer
  assert.equal(payload.content_ids[0], 'car-3')
  assert.equal(payload.num_items, 1)
  assert.equal(payload.contents[0].item_price, 35)
  assert.equal(payload.currency, 'TND')
  assert.match(payload.event_id, /^plany-/)
})

test('sendLeadEvent forwards metadata to data layer', async () => {
  env.STRIPE_CURRENCY_CODE = 'tnd'

  await gtm.sendLeadEvent({
    source: 'contact-form',
    hasEmail: true,
    subject: 'Inquiry',
    messageLength: 150,
    isAuthenticated: false,
  })

  assert.equal(dataLayerCalls[0].dataLayer.has_email, true)
  assert.equal(dataLayerCalls[0].dataLayer.message_length, 150)
  assert.equal(dataLayerCalls[0].dataLayer.lead_source, 'contact-form')
  assert.equal(dataLayerCalls[0].dataLayer.value, 1)
  assert.equal(dataLayerCalls[0].dataLayer.currency, 'TND')
  assert.match(dataLayerCalls[0].dataLayer.event_id, /^plany-/)
})

test('sendPageviewEvent relays page location', async () => {
  await gtm.sendPageviewEvent('/checkout', 'Checkout')

  assert.equal(dataLayerCalls[0].dataLayer.page_url, '/checkout')
  assert.equal(dataLayerCalls[0].dataLayer.page_location, '/checkout')
  assert.equal(dataLayerCalls[0].dataLayer.page_title, 'Checkout')
  assert.match(dataLayerCalls[0].dataLayer.event_id, /^plany-/)
})
