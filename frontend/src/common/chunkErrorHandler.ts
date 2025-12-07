const CHUNK_RELOAD_FLAG = 'bc:chunk-reload-attempted'

const setReloadAttempted = (storage: Storage) => storage.setItem(CHUNK_RELOAD_FLAG, '1')
const hasReloadAttempted = (storage: Storage) => storage.getItem(CHUNK_RELOAD_FLAG) === '1'

const isDynamicImportError = (reason: unknown): boolean => {
  if (reason instanceof Error && typeof reason.message === 'string') {
    return reason.message.toLowerCase().includes('dynamically imported module')
  }

  if (typeof reason === 'string') {
    return reason.toLowerCase().includes('dynamically imported module')
  }

  return false
}

const getEventSource = (event: ErrorEvent) => {
  if (event.filename) {
    return event.filename
  }

  const candidate = (event as { target?: { src?: string } }).target?.src

  if (typeof candidate === 'string') {
    return candidate
  }

  return undefined
}

const isMimeMismatch = (message: string) => {
  const normalized = message.toLowerCase()
  return normalized.includes('mime type') && normalized.includes('text/html')
}

const isChunkAssetError = (event: ErrorEvent): boolean => {
  const message = event.message || ''
  const source = getEventSource(event)

  if (!message && !source) {
    return false
  }

  const isAssetPath = typeof source === 'string' && source.includes('/assets/')
  return isAssetPath && isMimeMismatch(message)
}

const buildBypassedLocation = (current: Location) => {
  const nextURL = new URL(current.href)
  nextURL.searchParams.set('v', Date.now().toString())
  return nextURL.toString()
}

const reloadWithBypass = (win: Window) => {
  const { sessionStorage } = win

  if (hasReloadAttempted(sessionStorage)) {
    return
  }

  setReloadAttempted(sessionStorage)
  const nextHref = buildBypassedLocation(win.location)
  win.location.replace(nextHref)
}

const createRejectionHandler = (win: Window) => (event: PromiseRejectionEvent) => {
  if (!isDynamicImportError(event.reason)) {
    return
  }

  reloadWithBypass(win)
}

const createErrorHandler = (win: Window) => (event: ErrorEvent) => {
  if (!isChunkAssetError(event)) {
    return
  }

  reloadWithBypass(win)
}

export const setupChunkErrorHandler = (
  win: Window & typeof globalThis = window,
): (() => void) => {
  const rejectionHandler = createRejectionHandler(win)
  const errorHandler = createErrorHandler(win)

  win.addEventListener('unhandledrejection', rejectionHandler)
  win.addEventListener('error', errorHandler)

  return () => {
    win.removeEventListener('unhandledrejection', rejectionHandler)
    win.removeEventListener('error', errorHandler)
  }
}
