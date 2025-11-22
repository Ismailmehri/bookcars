const VERSION = 'v2'
const STATIC_CACHE = `plany-static-${VERSION}`
const RUNTIME_CACHE = `plany-runtime-${VERSION}`
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
]

const cacheFirst = async (request) => {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  const response = await fetch(request)
  const cache = await caches.open(STATIC_CACHE)
  cache.put(request, response.clone())
  return response
}

const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(request)
  const networkPromise = fetch(request)
    .then((response) => {
      cache.put(request, response.clone())
      return response
    })
    .catch(() => cached)

  return cached || networkPromise
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  const whitelist = [STATIC_CACHE, RUNTIME_CACHE]
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys
      .filter((key) => !whitelist.includes(key))
      .map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const isStaticAsset = STATIC_ASSETS.includes(new URL(request.url).pathname)
  const isApiCall = request.url.includes('/api/')

  if (isStaticAsset) {
    event.respondWith(cacheFirst(request))
    return
  }

  if (isApiCall) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  event.respondWith(staleWhileRevalidate(request))
})
