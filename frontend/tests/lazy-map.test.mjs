import { afterEach, test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const loadModule = async (relativePath) => import(pathToFileURL(path.join(distRoot, relativePath)))

const {
  createDeferredLoader,
  isIntersectionObserverAvailable,
  shouldLoadMapImmediately,
} = await loadModule('frontend/src/components/map/lazyMap.utils.js')

afterEach(() => {
  delete globalThis.window
})

test('isIntersectionObserverAvailable returns false without window and true with stub', () => {
  delete globalThis.window
  assert.equal(isIntersectionObserverAvailable(), false)

  globalThis.window = { IntersectionObserver: function Stub() {} }
  assert.equal(isIntersectionObserverAvailable(), true)
})

test('shouldLoadMapImmediately forces eager load regardless of IntersectionObserver availability', () => {
  delete globalThis.window
  assert.equal(shouldLoadMapImmediately(), true)

  globalThis.window = { IntersectionObserver: function Stub() {} }
  assert.equal(shouldLoadMapImmediately(), true)
})

test('createDeferredLoader triggers timeout when observer is missing', () => {
  let timedOut = false
  const windowStub = {
    setTimeout: (cb) => {
      cb()
      return 1
    },
    clearTimeout: () => undefined,
  }

  globalThis.window = windowStub

  const { observer, fallbackTimer } = createDeferredLoader({
    target: null,
    onIntersect: () => undefined,
    onTimeout: () => {
      timedOut = true
    },
  })

  assert.equal(observer, null)
  assert.equal(fallbackTimer, 1)
  assert.equal(timedOut, true)
})

test('createDeferredLoader disconnects observer after first intersection', () => {
  let cleared = false
  let intersected = false
  let observedTarget

  class StubObserver {
    constructor(callback, options) {
      this.callback = callback
      this.options = options
      this.disconnected = false
    }

    observe(target) {
      observedTarget = target
    }

    disconnect() {
      this.disconnected = true
    }

    trigger(entry) {
      this.callback([entry])
    }
  }

  globalThis.window = {
    setTimeout: () => 2,
    clearTimeout: () => {
      cleared = true
    },
    IntersectionObserver: StubObserver,
  }

  const target = { id: 'map-slot' }
  const { observer, fallbackTimer } = createDeferredLoader({
    target,
    rootMargin: '160px',
    onIntersect: () => {
      intersected = true
    },
    onTimeout: () => undefined,
  })

  observer.trigger({ isIntersecting: true, intersectionRatio: 0.2 })

  assert.equal(fallbackTimer, 2)
  assert.equal(intersected, true)
  assert.equal(cleared, true)
  assert.equal(observedTarget, target)
  assert.equal(observer.disconnected, true)
  assert.equal(observer.options.rootMargin, '160px')
})
