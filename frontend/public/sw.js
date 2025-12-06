const VERSION = '2.0.0'
const JS_CSS_CACHE = `plany-assets-${VERSION}`
const IMAGE_CACHE = `plany-images-${VERSION}`
const CACHE_NAMES = [JS_CSS_CACHE, IMAGE_CACHE]

const isHtmlResponse = (response) => {
  const contentType = response.headers.get('content-type')
  return typeof contentType === 'string' && contentType.includes('text/html')
}

const isCacheableResponse = (response, forbidHtml) => {
  if (!response || !response.ok) {
    return false
  }

  if (response.type === 'opaqueredirect') {
    return false
  }

  if (forbidHtml && isHtmlResponse(response)) {
    return false
  }

  return true
}

const purgeStaleCaches = async () => {
  const keys = await caches.keys()
  const deletions = keys
    .filter((key) => !CACHE_NAMES.includes(key))
    .map((key) => caches.delete(key))

  await Promise.all(deletions)
}

const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  const response = await fetch(request)

  if (isCacheableResponse(response, false)) {
    cache.put(request, response.clone())
  }

  return response
}

const networkFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetch(request)

    if (isCacheableResponse(response, true)) {
      await cache.put(request, response.clone())
      return response
    }
  } catch (error) {
    console.error('Network fetch failed, falling back to cache', error)
  }

  const cached = await cache.match(request)

  if (cached && !isHtmlResponse(cached)) {
    return cached
  }

  return Response.error()
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    purgeStaleCaches()
      .then(() => self.clients.claim())
      .catch((error) => {
        console.error('Failed to purge old caches', error)
      }),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)
  const isScriptOrStyle = /\.(?:js|css)(?:$|[?#])/i.test(url.pathname)
  const isImage =
    request.destination === 'image' || /\.(?:png|jpe?g|gif|webp|svg|ico)(?:$|[?#])/i.test(url.pathname)

  if (isScriptOrStyle) {
    event.respondWith(networkFirst(request, JS_CSS_CACHE))
    return
  }

  if (isImage) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
  }
})

// Keep the service worker versioned: update VERSION after each build to avoid serving stale assets.
