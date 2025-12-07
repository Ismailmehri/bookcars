import { after, afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(distRoot, relativePath)))

const createWindowStub = () => {
  const listeners = new Map()
  const sessionData = new Map()
  const recordedReplaces = []

  const addEventListener = (type, handler) => {
    const handlers = listeners.get(type) ?? []
    listeners.set(type, [...handlers, handler])
  }

  const removeEventListener = (type, handler) => {
    const handlers = listeners.get(type) ?? []
    listeners.set(
      type,
      handlers.filter((existing) => existing !== handler),
    )
  }

  const dispatch = (type, event) => {
    const handlers = listeners.get(type) ?? []
    handlers.forEach((handler) => handler(event))
  }

  const location = {
    href: 'https://plany.tn/search?lang=fr',
    replace: (nextHref) => {
      recordedReplaces.push(nextHref)
      location.href = nextHref
    },
  }

  return {
    addEventListener,
    removeEventListener,
    dispatch,
    location,
    sessionStorage: {
      getItem: (key) => sessionData.get(key) ?? null,
      setItem: (key, value) => {
        sessionData.set(key, value)
      },
      removeItem: (key) => {
        sessionData.delete(key)
        return undefined
      },
      clear: () => sessionData.clear(),
    },
    get recordedReplaces() {
      return recordedReplaces
    },
  }
}

let windowStub
let setupChunkErrorHandler

beforeEach(async () => {
  ;({ setupChunkErrorHandler } = await loadModule('frontend/src/common/chunkErrorHandler.js'))
  windowStub = createWindowStub()
})

afterEach(() => {
  windowStub = undefined
})

after(() => {
  delete globalThis.__TEST_IMPORT_META_ENV
})

test('reloads once when dynamic import fails', () => {
  const cleanup = setupChunkErrorHandler(windowStub)
  const rejection = {
    reason: new TypeError('error loading dynamically imported module: https://plany.tn/assets/Search.js'),
  }

  windowStub.dispatch('unhandledrejection', rejection)

  assert.equal(windowStub.sessionStorage.getItem('bc:chunk-reload-attempted'), '1')
  assert.equal(windowStub.recordedReplaces.length, 1)
  assert.match(windowStub.recordedReplaces[0], /\?(.+&)?v=\d+$/)
  cleanup()
})

test('does not reload repeatedly after a bypass attempt', () => {
  windowStub.sessionStorage.setItem('bc:chunk-reload-attempted', '1')
  const cleanup = setupChunkErrorHandler(windowStub)

  const rejection = {
    reason: new TypeError('error loading dynamically imported module: https://plany.tn/assets/NoMatch.js'),
  }

  windowStub.dispatch('unhandledrejection', rejection)

  assert.equal(windowStub.recordedReplaces.length, 0)
  cleanup()
})

test('handles module MIME mismatches on asset errors', () => {
  const cleanup = setupChunkErrorHandler(windowStub)

  const errorEvent = {
    message: 'Le chargement du module a été bloqué en raison d’un type MIME interdit (text/html)',
    filename: 'https://plany.tn/assets/Search-CO-T0gif.js',
  }

  windowStub.dispatch('error', errorEvent)

  assert.equal(windowStub.sessionStorage.getItem('bc:chunk-reload-attempted'), '1')
  assert.equal(windowStub.recordedReplaces.length, 1)
  cleanup()
})
