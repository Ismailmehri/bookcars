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
import {
  sendMetaEvent,
  getWindowLocationHref,
  generateEventId,
  type MetaEventInput,
  type MetaEventCustomDataContentItem,
  type MetaEventUserData,
} from '@/services/MetaEventService'
import * as UserService from '@/services/UserService'

type TagManagerModule = {
  initialize: (config: { gtmId: string }) => void
  dataLayer: (params: { dataLayer: Record<string, unknown> }) => void
}

const getTrackingId = () => env.GOOGLE_ANALYTICS_ID?.trim()

const isAnalyticsEnabled = () => Boolean(env.GOOGLE_ANALYTICS_ENABLED && getTrackingId())

let tagManagerPromise: Promise<TagManagerModule> | null = null

const loadTagManager = () => {
  if (!tagManagerPromise) {
    tagManagerPromise = import('react-gtm-module').then((module) => (module as { default?: TagManagerModule }).default ?? module as TagManagerModule)
  }

  return tagManagerPromise
}

const FALLBACK_ANALYTICS_CURRENCY = 'USD'

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

const sanitizeStringValue = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const getCookieValue = (name: string): string | undefined => {
  if (typeof document === 'undefined') {
    return undefined
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

const getFbpCookie = () => sanitizeStringValue(getCookieValue('_fbp'))
const getFbcCookie = () => sanitizeStringValue(getCookieValue('_fbc'))

const extractNames = (
  fullName?: string | null,
): { firstName?: string; lastName?: string } => {
  const sanitized = sanitizeStringValue(fullName)
  if (!sanitized) {
    return {}
  }
  const parts = sanitized.split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0] }
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export const buildMetaUserData = (
  overrides?: Partial<MetaEventUserData>,
): MetaEventUserData | undefined => {
  const currentUser = UserService.getCurrentUser()
  const names = extractNames(currentUser?.fullName)
  const userData: MetaEventUserData = {
    email: overrides?.email ?? currentUser?.email ?? undefined,
    phone: overrides?.phone ?? currentUser?.phone ?? undefined,
    city: overrides?.city ?? currentUser?.location ?? undefined,
    firstName: overrides?.firstName ?? names.firstName,
    lastName: overrides?.lastName ?? names.lastName,
    externalId: overrides?.externalId ?? currentUser?._id ?? undefined,
    fbp: overrides?.fbp ?? getFbpCookie(),
    fbc: overrides?.fbc ?? getFbcCookie(),
    userAgent: overrides?.userAgent,
    ip: overrides?.ip,
    zip: overrides?.zip,
    state: overrides?.state,
    country: overrides?.country,
    gender: overrides?.gender,
    dob: overrides?.dob,
  }

  const cleaned = Object.fromEntries(
    Object.entries(userData).filter(([, value]) => value !== undefined && value !== null && `${value}`.length > 0),
  ) as MetaEventUserData

  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

const mapItemsToMetaContents = (items: AnalyticsContent[]): MetaEventCustomDataContentItem[] =>
  items
    .filter((item) => Boolean(item.id))
    .map((item) => ({
      id: item.id,
      quantity: normalizeQuantity(item.quantity),
      price: normalizeAmount(item.price),
      itemPrice: normalizeAmount(item.price),
      title: item.name,
      category: item.category,
    }))

const sumItemQuantities = (contents: MetaEventCustomDataContentItem[]): number | undefined => {
  const total = contents.reduce((sum, item) => sum + (Number.isFinite(item.quantity) ? Number(item.quantity) : 0), 0)
  return total > 0 ? total : undefined
}

export const resolveEventSourceUrl = (url?: string): string | undefined => {
  const explicit = sanitizeStringValue(url)
  if (explicit && /^https?:\/\//i.test(explicit)) {
    return explicit
  }
  const fallback = getWindowLocationHref()
  if (explicit && fallback) {
    try {
      return new URL(explicit, fallback).toString()
    } catch {
      return fallback
    }
  }
  return fallback ?? explicit
}

export const getCurrentUserContext = () => {
  const user = UserService.getCurrentUser()
  return { user, isAuthenticated: Boolean(user) }
}

const sendMeta = (payload: MetaEventInput) => {
  sendMetaEvent(payload).catch(() => undefined)
}

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

  if (isAnalyticsEnabled()) {
    const loadManager = () => loadTagManager().then((tagManager) => tagManager.initialize({ gtmId: trackingId }))

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => loadManager())
    } else {
      setTimeout(() => loadManager(), 1500)
    }
  } else {
    console.warn('GTM is not enabled or GTM ID is missing.')
  }
}

// Fonction générique pour envoyer des événements
export const pushEvent = async (eventName: string, eventData: Record<string, unknown>) => {
  if (!isAnalyticsEnabled()) {
    return
  }

  const tagManager = await loadTagManager()
  tagManager.dataLayer({
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

  const eventId = generateEventId()

  const payload: PageViewAnalyticsPayload = {
    page_location: data.pageUrl,
    page_title: data.pageTitle,
  }

  return pushEvent('PageView', {
    ...payload,
    page_url: data.pageUrl,
    event_id: eventId,
  })

  const { isAuthenticated } = getCurrentUserContext()
  const eventSourceUrl = resolveEventSourceUrl(data.pageUrl)
  const userData = buildMetaUserData()

  const metaPayload: MetaEventInput = {
    eventName: 'PageView',
    eventSourceUrl,
    eventId,
    userData,
    customData: {
      pageLocation: payload.page_location ?? eventSourceUrl,
      pageTitle: payload.page_title,
      isAuthenticated,
    },
  }

  sendMeta(metaPayload)
}

const pushCommerceEvent = async (
  eventName: 'InitiateCheckout' | 'Purchase' | 'ViewContent',
  payload: AnalyticsCommercePayload,
  items: AnalyticsContent[],
  eventId: string,
) => {
  const dataLayerPayload: Record<string, unknown> = {
    ...payload,
    items: mapItemsForDataLayer(items),
    event_id: eventId,
  }

  return pushEvent(eventName, dataLayerPayload)
}

// Événement InitiateCheckout (Pixel Facebook: `InitiateCheckout`)
export const sendCheckoutEvent = async (input: CommerceEventInput) => {
  const payload = createCommercePayload(input, 'product')

  if (!payload) {
    return
  }

  const eventId = generateEventId()

  const eventPromise = pushCommerceEvent('InitiateCheckout', payload, input.items, eventId)

  const { isAuthenticated } = getCurrentUserContext()
  const contents = mapItemsToMetaContents(input.items)
  const contentIds = contents.map((item) => item.id)
  const userData = buildMetaUserData({
    email: input.customer?.email,
    phone: input.customer?.phone,
    firstName: input.customer?.firstName,
    lastName: input.customer?.lastName,
    city: input.customer?.city,
    externalId: input.customer?.externalId,
  })

  const metaPayload: MetaEventInput = {
    eventName: 'InitiateCheckout',
    eventSourceUrl: resolveEventSourceUrl(getWindowLocationHref()),
    eventId,
    userData,
    content: contentIds.length ? { ids: contentIds, type: input.contentType ?? payload.content_type } : undefined,
    customData: {
      value: input.value,
      currency: input.currency,
      contents,
      contentIds,
      contentType: input.contentType ?? payload.content_type,
      numItems: sumItemQuantities(contents),
      coupon: input.coupon,
      isAuthenticated,
    },
  }

  sendMeta(metaPayload)

  return eventPromise
}

// Événement Purchase (Pixel Facebook: `Purchase`)
export const sendPurchaseEvent = async (input: PurchaseEventInput) => {
  const payload = createCommercePayload(input, 'product')

  if (!payload) {
    return
  }

  const purchasePayload: AnalyticsCommercePayload = {
    ...payload,
    transaction_id: input.transactionId,
  }

  const eventId = generateEventId()

  const eventPromise = pushCommerceEvent('Purchase', purchasePayload, input.items, eventId)

  const { isAuthenticated } = getCurrentUserContext()
  const contents = mapItemsToMetaContents(input.items)
  const contentIds = contents.map((item) => item.id)
  const userData = buildMetaUserData({
    email: input.customer?.email,
    phone: input.customer?.phone,
    firstName: input.customer?.firstName,
    lastName: input.customer?.lastName,
    city: input.customer?.city,
    externalId: input.customer?.externalId,
  })

  const metaPayload: MetaEventInput = {
    eventName: 'Purchase',
    eventSourceUrl: resolveEventSourceUrl(getWindowLocationHref()),
    eventId,
    userData,
    content: contentIds.length ? { ids: contentIds, type: input.contentType ?? payload.content_type } : undefined,
    customData: {
      value: input.value,
      currency: input.currency,
      contents,
      contentIds,
      contentType: input.contentType ?? payload.content_type,
      numItems: sumItemQuantities(contents),
      coupon: input.coupon,
      orderId: input.transactionId,
      transactionId: input.transactionId,
      isAuthenticated,
    },
  }

  sendMeta(metaPayload)

  return eventPromise
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

  const eventId = generateEventId()

  return pushEvent('Search', { ...searchData, event_id: eventId })

  const { isAuthenticated } = getCurrentUserContext()
  const userData = buildMetaUserData()

  const metaPayload: MetaEventInput = {
    eventName: 'Search',
    eventSourceUrl: resolveEventSourceUrl(getWindowLocationHref()),
    eventId,
    userData,
    customData: {
      searchString: input.searchTerm,
      searchTerm: input.searchTerm,
      pickupLocationId: input.pickupLocationId,
      dropOffLocationId: input.dropOffLocationId,
      startDate: input.startDate?.toISOString(),
      endDate: input.endDate?.toISOString(),
      sameLocation: input.sameLocation,
      filters: input.filters,
      isAuthenticated,
    },
  }

  sendMeta(metaPayload)
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

  const eventId = generateEventId()

  const eventPromise = pushCommerceEvent('ViewContent', payload, [
    {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      category: item.category,
    },
  ], eventId)

  const { isAuthenticated } = getCurrentUserContext()
  const contents = mapItemsToMetaContents([
    { id: item.id, name: item.name, price: item.price, quantity: 1, category: item.category },
  ])
  const contentIds = contents.map((content) => content.id)

  const metaPayload: MetaEventInput = {
    eventName: 'ViewContent',
    eventSourceUrl: resolveEventSourceUrl(getWindowLocationHref()),
    eventId,
    userData: buildMetaUserData(),
    content: { ids: contentIds, type: item.category ?? 'product' },
    customData: {
      value: item.price,
      currency: item.currency,
      contents,
      contentIds,
      contentType: item.category ?? 'product',
      numItems: sumItemQuantities(contents),
      isAuthenticated,
    },
  }

  sendMeta(metaPayload)

  return eventPromise
}

export const sendLeadEvent = (input: LeadEventInput) => {
  const leadValue = typeof input.value === 'number' && Number.isFinite(input.value) && input.value > 0 ? input.value : 1

  const data: LeadAnalyticsPayload = {
    value: normalizeAmount(leadValue),
    currency: normalizeCurrency(input.currency),
    lead_source: input.source ?? 'contact-form',
    ...(typeof input.hasEmail === 'boolean' ? { has_email: input.hasEmail } : {}),
    ...(input.subject ? { subject: input.subject } : {}),
    ...(typeof input.messageLength === 'number' ? { message_length: input.messageLength } : {}),
    ...(typeof input.isAuthenticated === 'boolean' ? { is_authenticated: input.isAuthenticated } : {}),
  }

  const eventId = generateEventId()

  const leadPromise = pushEvent('Lead', { ...data, event_id: eventId })

  const { isAuthenticated } = getCurrentUserContext()
  const userData = buildMetaUserData({
    email: input.email,
    phone: input.phone,
    firstName: input.firstName,
    lastName: input.lastName,
    city: input.city,
  })

  const metaPayload: MetaEventInput = {
    eventName: 'Lead',
    eventSourceUrl: resolveEventSourceUrl(getWindowLocationHref()),
    eventId,
    userData,
    customData: {
      value: normalizeAmount(leadValue),
      currency: normalizeCurrency(input.currency),
      leadSource: input.source ?? 'contact-form',
      hasEmail: input.hasEmail ?? Boolean(userData?.email),
      subject: input.subject,
      messageLength: input.messageLength,
      isAuthenticated,
    },
  }

  sendMeta(metaPayload)

  return leadPromise
}
