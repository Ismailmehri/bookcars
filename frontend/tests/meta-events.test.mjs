import { after, afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')

const createEnvProxy = (overrides = {}) =>
  new Proxy(overrides, {
    get(target, property) {
      if (typeof property === 'string' && property in target) {
        return target[property]
      }
      if (property === Symbol.toStringTag) {
        return 'ImportMetaEnvTestProxy'
      }
      return ''
    },
  })

globalThis.__TEST_IMPORT_META_ENV = createEnvProxy({
  VITE_NODE_ENV: 'test',
  VITE_BC_API_HOST: 'http://localhost:3000',
  VITE_BC_DEFAULT_LANGUAGE: 'en',
  VITE_BC_META_TEST_EVENT_CODE: 'TEST_META_CODE',
  VITE_BC_MAX_BOOKING_MONTHS: '6',
})

const loadModule = async (relativePath) => import(pathToFileURL(path.join(distRoot, relativePath)))

const metaServiceModule = await loadModule('frontend/src/services/MetaEventService.js')
const helpersModule = await loadModule('frontend/src/context/metaEvents.helpers.js')
const {
  normalizeMetaEventInput,
  createMetaEventClient,
  MetaEventRequestError,
} = metaServiceModule
const { buildHrefFromLocation, createTrackEventHandler, createTrackPageViewHandler } = helpersModule

const defaultWindow = {
  location: {
    href: 'https://plany.tn/checkout?lang=fr',
    origin: 'https://plany.tn',
    pathname: '/checkout',
    search: '?lang=fr',
    hash: '',
  },
}

const defaultNavigator = {
  userAgent: 'MetaTestAgent/1.0',
}

const defineGlobal = (key, value) => {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  })
}

beforeEach(() => {
  defineGlobal('window', { ...defaultWindow })
  defineGlobal('navigator', { ...defaultNavigator })
})

afterEach(() => {
  delete globalThis.window
  delete globalThis.navigator
})

after(() => {
  delete globalThis.__TEST_IMPORT_META_ENV
})

test('normalizeMetaEventInput trims payload and applies defaults', () => {
  const normalized = normalizeMetaEventInput(
    {
      eventName: ' Purchase ',
      eventTime: 1722100000,
      eventSourceUrl: '  https://example.com/path  ',
      actionSource: '  website  ',
      userData: {
        email: ' user@test.com ',
        phone: ' +21612345678 ',
        userAgent: ' CustomAgent/1.0 ',
      },
      customData: {
        value: 199.99,
        currency: ' tnd ',
        dataProcessingOptions: [' LDU ', ' '],
      },
      content: {
        ids: [' car_1 ', ''],
        type: ' car ',
      },
    },
    {
      userAgent: 'FallbackAgent/2.0',
      eventSourceUrl: 'https://fallback.example.com',
      defaultTestEventCode: ' TEST_CODE ',
    },
  )

  assert.equal(normalized.eventName, 'Purchase')
  assert.equal(normalized.eventTime, 1722100000)
  assert.equal(normalized.actionSource, 'website')
  assert.equal(normalized.eventSourceUrl, 'https://example.com/path')
  assert.deepEqual(normalized.userData, {
    email: 'user@test.com',
    phone: '+21612345678',
    userAgent: 'CustomAgent/1.0',
  })
  assert.deepEqual(normalized.customData, {
    value: 199.99,
    currency: 'TND',
    dataProcessingOptions: ['LDU'],
  })
  assert.deepEqual(normalized.content, {
    ids: ['car_1'],
    type: 'car',
  })
  assert.equal(normalized.testEventCode, 'TEST_CODE')
})

test('createMetaEventClient merges defaults and throws MetaEventRequestError on failure', async () => {
  const calls = []
  const stubHttp = {
    async post(url, body) {
      calls.push({ url, body })
      return { data: { success: true, meta_response: { events_received: 1 } } }
    },
  }

  const client = createMetaEventClient(stubHttp, { defaultTestEventCode: 'QA123' })
  const response = await client.sendEvent({
    eventName: 'ViewContent',
    content: { ids: [' car42 '], type: ' car ' },
  })

  assert.equal(response.success, true)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, '/api/meta/events')
  assert.equal(calls[0].body.eventSourceUrl, 'https://plany.tn/checkout?lang=fr')
  assert.equal(calls[0].body.testEventCode, 'QA123')
  assert.deepEqual(calls[0].body.content, { ids: ['car42'], type: 'car' })
  assert.equal(calls[0].body.userData.userAgent, 'MetaTestAgent/1.0')

  const failingHttp = {
    async post() {
      const error = new Error('Bad Request')
      error.response = { status: 400, data: 'Invalid payload' }
      throw error
    },
  }

  const failingClient = createMetaEventClient(failingHttp)

  await assert.rejects(
    failingClient.sendEvent({
      eventName: 'Purchase',
      customData: { value: 150, currency: 'TND' },
    }),
    (error) => {
      assert.ok(error instanceof MetaEventRequestError)
      assert.equal(error.statusCode, 400)
      assert.equal(error.message, 'Invalid payload')
      return true
    },
  )
})

test('createTrackEventHandler updates status lifecycle and applies overrides', async () => {
  let recordedPayload
  const statuses = []
  const errors = []
  const metaClient = {
    async sendEvent(payload) {
      recordedPayload = payload
      return { success: true, meta_response: { events_received: 1 } }
    },
  }

  const handler = createTrackEventHandler({
    metaClient,
    getOverrideTestCode: () => 'CODE-123',
    setStatus: (value) => statuses.push(value),
    setError: (value) => errors.push(value),
    setLastEventName: () => {},
  })

  const response = await handler({ eventName: 'Click' })
  assert.equal(response.success, true)
  assert.equal(recordedPayload.testEventCode, 'CODE-123')
  assert.deepEqual(statuses, ['loading', 'success'])
  assert.deepEqual(errors, [undefined])

  const failureStatuses = []
  const failureErrors = []
  const failureHandler = createTrackEventHandler({
    metaClient: {
      async sendEvent() {
        throw new MetaEventRequestError('Network down', 502)
      },
    },
    getOverrideTestCode: () => undefined,
    setStatus: (value) => failureStatuses.push(value),
    setError: (value) => failureErrors.push(value ?? ''),
    setLastEventName: () => {},
  })

  const failedResponse = await failureHandler({ eventName: 'Purchase' })
  assert.equal(failedResponse.success, false)
  assert.equal(failureStatuses.at(-1), 'error')
  assert.equal(failureErrors.at(-1), 'Network down')
})

test('createTrackPageViewHandler derives source URL when missing', async () => {
  const captured = []
  const handler = createTrackPageViewHandler({
    trackEvent: async (payload) => {
      captured.push(payload)
      return { success: true }
    },
    resolveHref: () => 'https://example.test/page',
  })

  await handler()
  await handler({ userData: { email: 'user@example.com' } })
  assert.equal(captured.length, 2)
  assert.deepEqual(captured[0], { eventName: 'PageView', eventSourceUrl: 'https://example.test/page' })
  assert.deepEqual(captured[1], {
    eventName: 'PageView',
    eventSourceUrl: 'https://example.test/page',
    userData: { email: 'user@example.com' },
  })
})

test('buildHrefFromLocation falls back to default origin when window is missing', () => {
  delete globalThis.window
  const href = buildHrefFromLocation({ pathname: '/meta', search: '', hash: '' })
  assert.equal(href, 'https://plany.tn/meta')
})
