import TagManager from 'react-gtm-module'
import env from '@/config/env.config'
import {
  AnalyticsCommercePayload,
  AnalyticsContent,
  CommerceEventInput,
  LeadAnalyticsPayload,
  LeadEventInput,
  PageViewAnalyticsPayload,
  PageViewEventInput,
  PurchaseEventInput,
  SearchAnalyticsPayload,
  SearchEventInput,
  ViewContentEventInput,
} from './analytics.types'

type FbqCommand = 'track' | 'trackCustom' | 'init' | 'set' | string
type FbqArguments = [FbqCommand, ...unknown[]]
type FbqCallable = (...args: FbqArguments) => unknown

interface FacebookPixelFunction extends FbqCallable {
  callMethod?: FbqCallable
  queue?: FbqArguments[]
  push?: (args: FbqArguments) => unknown
  loaded?: boolean
  version?: string
  __planyPatched?: boolean
}

declare global {
  interface Window {
    fbq?: FacebookPixelFunction
    _fbq?: FacebookPixelFunction
  }
}

const FACEBOOK_STANDARD_EVENTS = new Set<string>([
  'AddPaymentInfo',
  'AddToCart',
  'AddToWishlist',
  'CompleteRegistration',
  'Contact',
  'CustomizeProduct',
  'Donate',
  'FindLocation',
  'InitiateCheckout',
  'Lead',
  'PageView',
  'Purchase',
  'Schedule',
  'Search',
  'StartTrial',
  'SubmitApplication',
  'Subscribe',
  'ViewContent',
])

const FACEBOOK_PATCH_INTERVAL = 250
const FACEBOOK_PATCH_MAX_ATTEMPTS = 20

let isGtmInitialized = false
let hasScheduledFacebookPatch = false
let isFacebookPixelPatched = false
let facebookPatchAttempts = 0

const getTrackingId = () => env.GOOGLE_ANALYTICS_ID?.trim()

const isAnalyticsEnabled = () => Boolean(env.GOOGLE_ANALYTICS_ENABLED && getTrackingId())

const isBrowserEnvironment = typeof window !== 'undefined' && typeof document !== 'undefined'

const FALLBACK_ANALYTICS_CURRENCY = 'USD'

const GTM_SCRIPT_SRC = 'https://www.googletagmanager.com/gtm.js'

const hasExistingGtmScript = (trackingId: string | undefined) => {
  if (!trackingId || !isBrowserEnvironment) {
    return false
  }

  const scriptSelector = `script[src^="${GTM_SCRIPT_SRC}"]`
  const scripts = document.querySelectorAll<HTMLScriptElement>(scriptSelector)

  return Array.from(scripts).some((script) => script.src.includes(`id=${trackingId}`))
}

const normalizeFacebookArguments = (args: FbqArguments): FbqArguments => {
  const [command, eventName, ...rest] = args

  if (command === 'track' && typeof eventName === 'string' && !FACEBOOK_STANDARD_EVENTS.has(eventName)) {
    return ['trackCustom', eventName, ...rest]
  }

  return args
}

const patchFacebookPixel = (): boolean => {
  if (!isBrowserEnvironment || isFacebookPixelPatched) {
    return isFacebookPixelPatched
  }

  const fbWindow = window as Window & { fbq?: FacebookPixelFunction }
  const { fbq } = fbWindow

  if (!fbq || typeof fbq !== 'function' || fbq.__planyPatched) {
    if (fbq?.__planyPatched) {
      isFacebookPixelPatched = true
    }
    return isFacebookPixelPatched
  }

  const originalCallMethod = fbq.callMethod?.bind(fbq)
  const originalPush = fbq.push?.bind(fbq)

  const patched: FacebookPixelFunction = ((...args: FbqArguments) => {
    const patchedArgs = normalizeFacebookArguments(args)

    if (fbq.callMethod) {
      return fbq.callMethod(...patchedArgs)
    }

    fbq.queue = fbq.queue ?? []
    fbq.queue.push(patchedArgs)

    return undefined
  }) as FacebookPixelFunction

  patched.queue = fbq.queue
  patched.loaded = fbq.loaded
  patched.version = fbq.version

  if (originalCallMethod) {
    patched.callMethod = ((...args: FbqArguments) => originalCallMethod(...normalizeFacebookArguments(args))) as FbqCallable
  }

  if (originalPush) {
    patched.push = ((args: FbqArguments) => originalPush(normalizeFacebookArguments(args)))
  }

  patched.__planyPatched = true
  fbWindow.fbq = patched
  fbWindow._fbq = patched
  isFacebookPixelPatched = true

  return true
}

const scheduleFacebookPixelPatch = () => {
  if (!isBrowserEnvironment || hasScheduledFacebookPatch) {
    return
  }

  hasScheduledFacebookPatch = true
  facebookPatchAttempts = 0

  const attemptPatch = () => {
    if (patchFacebookPixel()) {
      return
    }

    facebookPatchAttempts += 1

    if (facebookPatchAttempts < FACEBOOK_PATCH_MAX_ATTEMPTS) {
      window.setTimeout(attemptPatch, FACEBOOK_PATCH_INTERVAL)
    }
  }

  attemptPatch()
}

const sanitizeCurrency = (value?: string) => {
  const trimmed = value?.trim()

  if (!trimmed) {
    return undefined
  }

  return trimmed.toUpperCase()
}

export const getDefaultAnalyticsCurrency = () =>
  sanitizeCurrency(env.STRIPE_CURRENCY_CODE) ?? sanitizeCurrency(env.CURRENCY) ?? FALLBACK_ANALYTICS_CURRENCY

const normalizeCurrency = (value?: string) => sanitizeCurrency(value) ?? getDefaultAnalyticsCurrency()

const normalizeAmount = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0
  }

  const safeValue = Math.max(0, value)
  return Number(safeValue.toFixed(2))
}

const normalizeQuantity = (value: number) => {
  if (!Number.isFinite(value)) {
    return 1
  }

  return Math.max(1, Math.round(value))
}

const mapItemsForAnalytics = (items: AnalyticsContent[]) =>
  items
    .filter((item) => Boolean(item.id))
    .map((item) => ({
      id: item.id,
      item_price: normalizeAmount(item.price),
      quantity: normalizeQuantity(item.quantity),
      ...(item.name ? { title: item.name } : {}),
      ...(item.category ? { category: item.category } : {}),
    }))

const mapItemsForDataLayer = (items: AnalyticsContent[]) =>
  items
    .filter((item) => Boolean(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      quantity: normalizeQuantity(item.quantity),
      price: normalizeAmount(item.price),
      ...(item.category ? { category: item.category } : {}),
    }))

const createCommercePayload = (
  input: CommerceEventInput,
  fallbackContentType: string,
): AnalyticsCommercePayload | null => {
  const contents = mapItemsForAnalytics(input.items)

  if (!contents.length) {
    return null
  }

  const contentIds = contents.map((item) => item.id)
  const numItems = contents.reduce((sum, item) => sum + item.quantity, 0)

  return {
    value: normalizeAmount(input.value),
    currency: normalizeCurrency(input.currency),
    contents,
    content_ids: contentIds,
    num_items: numItems,
    content_type: input.contentType ?? fallbackContentType,
    ...(input.coupon ? { coupon: input.coupon } : {}),
  }
}

// Initialisation de Google Tag Manager
export const initGTM = () => {
  const trackingId = getTrackingId()

  if (!isAnalyticsEnabled()) {
    console.warn('GTM is not enabled or GTM ID is missing.')
    return
  }

  if (!isGtmInitialized) {
    if (!hasExistingGtmScript(trackingId)) {
      TagManager.initialize({ gtmId: trackingId })
    }

    isGtmInitialized = true
  }

  scheduleFacebookPixelPatch()
}

// Fonction générique pour envoyer des événements
export const pushEvent = (eventName: string, eventData: Record<string, unknown>) => {
  if (!isAnalyticsEnabled()) {
    return
  }

  TagManager.dataLayer({
    dataLayer: {
      event: eventName,
      ...eventData,
    },
  })
}

// Événement PageView (compatible avec le Pixel Facebook `PageView`)
export const sendPageviewEvent = (pageUrl: string, pageTitle: string) => {
  const data: PageViewEventInput = {
    pageUrl,
    pageTitle,
  }

  const payload: PageViewAnalyticsPayload = {
    page_location: data.pageUrl,
    page_title: data.pageTitle,
  }

  pushEvent('PageView', {
    ...payload,
    page_url: data.pageUrl,
  })
}

const pushCommerceEvent = (
  eventName: 'InitiateCheckout' | 'Purchase' | 'ViewContent',
  payload: AnalyticsCommercePayload,
  items: AnalyticsContent[],
) => {
  const dataLayerPayload: Record<string, unknown> = {
    ...payload,
    items: mapItemsForDataLayer(items),
  }

  pushEvent(eventName, dataLayerPayload)
}

// Événement InitiateCheckout (Pixel Facebook: `InitiateCheckout`)
export const sendCheckoutEvent = (input: CommerceEventInput) => {
  const payload = createCommercePayload(input, 'product')

  if (!payload) {
    return
  }

  pushCommerceEvent('InitiateCheckout', payload, input.items)
}

// Événement Purchase (Pixel Facebook: `Purchase`)
export const sendPurchaseEvent = (input: PurchaseEventInput) => {
  const payload = createCommercePayload(input, 'product')

  if (!payload) {
    return
  }

  const purchasePayload: AnalyticsCommercePayload = {
    ...payload,
    transaction_id: input.transactionId,
  }

  pushCommerceEvent('Purchase', purchasePayload, input.items)
}

// Événement Search (Pixel Facebook: `Search`)
export const sendSearchEvent = (input: SearchEventInput) => {
  const searchData: SearchAnalyticsPayload = {
    search_string: input.searchTerm,
    search_term: input.searchTerm,
    ...(input.pickupLocationId ? { pickup_location_id: input.pickupLocationId } : {}),
    ...(input.dropOffLocationId ? { dropoff_location_id: input.dropOffLocationId } : {}),
    ...(input.startDate ? { start_date: input.startDate.toISOString() } : {}),
    ...(input.endDate ? { end_date: input.endDate.toISOString() } : {}),
    ...(typeof input.sameLocation === 'boolean' ? { same_location: input.sameLocation } : {}),
    ...(input.filters ? { filters: input.filters } : {}),
  }

  pushEvent('Search', searchData)
}

// Événement ViewContent (Pixel Facebook: `ViewContent`)
export const sendViewContentEvent = (item: ViewContentEventInput) => {
  const payload: AnalyticsCommercePayload = {
    value: normalizeAmount(item.price),
    currency: normalizeCurrency(item.currency),
    contents: mapItemsForAnalytics([
      {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        category: item.category,
      },
    ]),
    content_ids: [item.id],
    num_items: 1,
    content_type: item.category ?? 'product',
  }

  pushCommerceEvent('ViewContent', payload, [
    {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      category: item.category,
    },
  ])
}

export const sendLeadEvent = (input: LeadEventInput) => {
  const data: LeadAnalyticsPayload = {
    lead_source: input.source ?? 'contact-form',
    ...(typeof input.hasEmail === 'boolean' ? { has_email: input.hasEmail } : {}),
    ...(input.subject ? { subject: input.subject } : {}),
    ...(typeof input.messageLength === 'number' ? { message_length: input.messageLength } : {}),
    ...(typeof input.isAuthenticated === 'boolean' ? { is_authenticated: input.isAuthenticated } : {}),
  }

  pushEvent('Lead', data)
}

export const __testing = {
  resetInternalState: () => {
    isGtmInitialized = false
    hasScheduledFacebookPatch = false
    isFacebookPixelPatched = false
    facebookPatchAttempts = 0
  },
  isFacebookPixelPatched: () => isFacebookPixelPatched,
}
