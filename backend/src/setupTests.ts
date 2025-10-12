import { afterEach } from 'vitest'

declare global {
  // eslint-disable-next-line no-var
  var ResizeObserver: typeof ResizeObserver
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  // @ts-expect-error - assign mock to global
  globalThis.ResizeObserver = ResizeObserverMock
}

afterEach(() => {
  document.body.innerHTML = ''
})
