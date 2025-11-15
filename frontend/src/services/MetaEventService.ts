import type { AxiosInstance } from 'axios'
import axiosInstance from '@/services/axiosInstance'

export type MetaEventName =
  | 'form_start'
  | 'FormStart'
  | 'form_submit'
  | 'FormSubmit'
  | 'AddToCart'
  | 'add_to_cart'
  | 'InitiateCheckout'
  | 'initiate_checkout'
  | 'PageView'
  | 'page_view'
  | 'ViewContent'
  | 'view_content'
  | 'Purchase'
  | 'purchase'
  | 'Click'
  | 'click'
  | 'Search'
  | 'search'
  | 'Lead'
  | 'lead'

export interface MetaEventUserData {
  email?: string
  phone?: string
  zip?: string
  city?: string
  state?: string
  country?: string
  gender?: string
  dob?: string
  ip?: string
  userAgent?: string
  fbp?: string
  fbc?: string
  firstName?: string
  lastName?: string
  externalId?: string
}

export interface MetaEventCustomData {
  value?: number
  currency?: string
  dataProcessingOptions?: string[]
  orderId?: string
  transactionId?: string
  contents?: MetaEventCustomDataContentItem[]
  contentIds?: string[]
  contentType?: string
  numItems?: number
  coupon?: string
  pageLocation?: string
  pageTitle?: string
  searchString?: string
  searchTerm?: string
  pickupLocationId?: string
  dropOffLocationId?: string
  startDate?: string
  endDate?: string
  sameLocation?: boolean
  filters?: Record<string, unknown>
  leadSource?: string
  hasEmail?: boolean
  subject?: string
  messageLength?: number
  isAuthenticated?: boolean
}

export interface MetaEventContent {
  ids?: string[]
  type?: string
}

export interface MetaEventCustomDataContentItem {
  id: string
  quantity?: number
  price?: number
  itemPrice?: number
  title?: string
  category?: string
}

export interface MetaEventAttributionData {
  attributionShare?: string | number
  adId?: string
  campaignId?: string
  clickId?: string
  engagementTime?: string | number
}

export interface MetaEventOriginalEventData {
  eventName?: string
  eventTime?: number
}

export interface MetaEventInput {
  eventName: MetaEventName | string
  eventTime?: number
  eventSourceUrl?: string
  actionSource?: string
  userData?: MetaEventUserData
  customData?: MetaEventCustomData
  content?: MetaEventContent
  testEventCode?: string
  attributionData?: MetaEventAttributionData
  originalEventData?: MetaEventOriginalEventData
}

export interface MetaEventResponseBody {
  success: boolean
  meta_response?: Record<string, unknown>
  error?: string
}

export interface MetaEventClient {
  sendEvent: (payload: MetaEventInput) => Promise<MetaEventResponseBody>
}

export class MetaEventRequestError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.statusCode = statusCode
  }
}

type NormalizeOptions = {
  userAgent?: string
  eventSourceUrl?: string
  defaultActionSource?: string
  defaultTestEventCode?: string
}

const DEFAULT_ACTION_SOURCE = 'website'
const DEFAULT_ORIGIN = 'http://localhost'

export const getNavigatorUserAgent = (): string | undefined => {
  if (typeof navigator !== 'undefined' && typeof navigator.userAgent === 'string') {
    return navigator.userAgent
  }
  return undefined
}

export const getWindowLocationHref = (): string | undefined => {
  if (typeof window !== 'undefined' && window.location?.href) {
    return window.location.href
  }
  return undefined
}

const sanitizeString = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const sanitizeStringArray = (items?: string[]): string[] | undefined => {
  if (!items) {
    return undefined
  }
  const cleaned = items
    .map((item) => sanitizeString(item))
    .filter((item): item is string => Boolean(item))
  return cleaned.length > 0 ? cleaned : undefined
}

const removeEmpty = <T extends object>(value?: T): T | undefined => {
  if (!value) {
    return undefined
  }

  const result: Record<string, unknown> = {}
  Object.entries(value as Record<string, unknown>).forEach(([key, current]) => {
    if (Array.isArray(current)) {
      if (current.length > 0) {
        result[key] = current
      }
      return
    }

    if (typeof current === 'number') {
      if (!Number.isNaN(current)) {
        result[key] = current
      }
      return
    }

    if (typeof current === 'boolean') {
      result[key] = current
      return
    }

    if (current !== undefined && current !== null && `${current}`.length > 0) {
      result[key] = current
    }
  })

  return Object.keys(result).length > 0 ? (result as T) : undefined
}

const sanitizeRecord = (value?: Record<string, unknown>): Record<string, unknown> | undefined => {
  if (!value) {
    return undefined
  }
  const cleaned: Record<string, unknown> = {}
  Object.entries(value).forEach(([key, current]) => {
    if (current !== undefined) {
      cleaned[key] = current
    }
  })
  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

const toFiniteNumber = (value?: number): number | undefined => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return undefined
  }
  return value
}

const toPositiveInteger = (value?: number): number | undefined => {
  const finite = toFiniteNumber(value)
  if (finite === undefined) {
    return undefined
  }
  const rounded = Math.round(Math.abs(finite))
  return rounded > 0 ? rounded : undefined
}

const toPrice = (value?: number): number | undefined => {
  const finite = toFiniteNumber(value)
  if (finite === undefined) {
    return undefined
  }
  const safe = Math.max(0, finite)
  return Number(safe.toFixed(2))
}

const normaliseContents = (
  items?: MetaEventCustomDataContentItem[],
): MetaEventCustomDataContentItem[] | undefined => {
  if (!items) {
    return undefined
  }
  const mapped = items
    .map((item) => {
      const id = sanitizeString(item.id)
      if (!id) {
        return undefined
      }
      const quantity = toPositiveInteger(item.quantity)
      const price = toPrice(item.itemPrice ?? item.price)
      const content: MetaEventCustomDataContentItem = { id }
      if (quantity) {
        content.quantity = quantity
      }
      if (price !== undefined) {
        content.price = price
        content.itemPrice = price
      }
      const title = sanitizeString(item.title)
      if (title) {
        content.title = title
      }
      const category = sanitizeString(item.category)
      if (category) {
        content.category = category
      }
      return content
    })
    .filter((item): item is MetaEventCustomDataContentItem => Boolean(item))

  return mapped.length > 0 ? mapped : undefined
}

const normaliseUserData = (
  userData?: MetaEventUserData,
  fallbackUserAgent?: string,
): MetaEventUserData | undefined => {
  const normalised: MetaEventUserData = {
    email: sanitizeString(userData?.email),
    phone: sanitizeString(userData?.phone),
    zip: sanitizeString(userData?.zip),
    city: sanitizeString(userData?.city),
    state: sanitizeString(userData?.state),
    country: sanitizeString(userData?.country),
    gender: sanitizeString(userData?.gender),
    dob: sanitizeString(userData?.dob),
    ip: sanitizeString(userData?.ip),
    userAgent: sanitizeString(userData?.userAgent) ?? sanitizeString(fallbackUserAgent),
    fbp: sanitizeString(userData?.fbp),
    fbc: sanitizeString(userData?.fbc),
    firstName: sanitizeString(userData?.firstName),
    lastName: sanitizeString(userData?.lastName),
    externalId: sanitizeString(userData?.externalId),
  }

  return removeEmpty(normalised)
}

const normaliseCustomData = (customData?: MetaEventCustomData): MetaEventCustomData | undefined => {
  if (!customData) {
    return undefined
  }

  const dataProcessingOptions = sanitizeStringArray(customData.dataProcessingOptions)
  const contents = normaliseContents(customData.contents)

  const normalised: MetaEventCustomData = {
    value: toPrice(customData.value),
    currency: sanitizeString(customData.currency)?.toUpperCase(),
    dataProcessingOptions,
    orderId: sanitizeString(customData.orderId),
    transactionId: sanitizeString(customData.transactionId),
    contents,
    contentIds: sanitizeStringArray(customData.contentIds),
    contentType: sanitizeString(customData.contentType),
    numItems: toPositiveInteger(customData.numItems),
    coupon: sanitizeString(customData.coupon),
    pageLocation: sanitizeString(customData.pageLocation),
    pageTitle: sanitizeString(customData.pageTitle),
    searchString: sanitizeString(customData.searchString),
    searchTerm: sanitizeString(customData.searchTerm),
    pickupLocationId: sanitizeString(customData.pickupLocationId),
    dropOffLocationId: sanitizeString(customData.dropOffLocationId),
    startDate: sanitizeString(customData.startDate),
    endDate: sanitizeString(customData.endDate),
    sameLocation: typeof customData.sameLocation === 'boolean' ? customData.sameLocation : undefined,
    filters: sanitizeRecord(customData.filters),
    leadSource: sanitizeString(customData.leadSource),
    hasEmail: typeof customData.hasEmail === 'boolean' ? customData.hasEmail : undefined,
    subject: sanitizeString(customData.subject),
    messageLength: toPositiveInteger(customData.messageLength),
    isAuthenticated: typeof customData.isAuthenticated === 'boolean' ? customData.isAuthenticated : undefined,
  }

  return removeEmpty(normalised)
}

const normaliseContent = (content?: MetaEventContent): MetaEventContent | undefined => {
  if (!content) {
    return undefined
  }

  const ids = sanitizeStringArray(content.ids)
  const type = sanitizeString(content.type)

  const normalised: MetaEventContent = {
    ids,
    type,
  }

  return removeEmpty(normalised)
}

const normaliseAttributionData = (
  data?: MetaEventAttributionData,
): MetaEventAttributionData | undefined => {
  if (!data) {
    return undefined
  }

  const numericShare = typeof data.attributionShare === 'number' && Number.isFinite(data.attributionShare)
    ? data.attributionShare
    : undefined
  const attributionShare = numericShare ?? sanitizeString(typeof data.attributionShare === 'string' ? data.attributionShare : undefined)

  const numericEngagement = typeof data.engagementTime === 'number' && Number.isFinite(data.engagementTime)
    ? Math.floor(data.engagementTime)
    : undefined
  const engagementTime = numericEngagement ?? sanitizeString(typeof data.engagementTime === 'string' ? data.engagementTime : undefined)

  const normalised: MetaEventAttributionData = {
    attributionShare,
    adId: sanitizeString(data.adId),
    campaignId: sanitizeString(data.campaignId),
    clickId: sanitizeString(data.clickId),
    engagementTime,
  }

  return removeEmpty(normalised)
}

const normaliseOriginalEventData = (
  data?: MetaEventOriginalEventData,
): MetaEventOriginalEventData | undefined => {
  if (!data) {
    return undefined
  }

  const normalised: MetaEventOriginalEventData = {
    eventName: sanitizeString(data.eventName),
    eventTime: typeof data.eventTime === 'number' && Number.isFinite(data.eventTime)
      ? Math.floor(data.eventTime)
      : undefined,
  }

  return removeEmpty(normalised)
}

const resolveEventTime = (eventTime?: number): number => {
  if (typeof eventTime === 'number' && Number.isFinite(eventTime) && eventTime > 0) {
    return Math.floor(eventTime)
  }
  return Math.floor(Date.now() / 1000)
}

const resolveEventSourceUrl = (
  requestedUrl?: string,
  inferredUrl?: string,
): string | undefined => {
  const explicit = sanitizeString(requestedUrl)
  if (explicit) {
    return explicit
  }
  const fallback = sanitizeString(inferredUrl)
  if (fallback) {
    return fallback
  }

  if (typeof window !== 'undefined' && window.location) {
    const origin = sanitizeString(window.location.origin) ?? DEFAULT_ORIGIN
    const path = `${window.location.pathname ?? ''}${window.location.search ?? ''}${window.location.hash ?? ''}`
    return `${origin}${path}`
  }

  return undefined
}

export const normalizeMetaEventInput = (
  payload: MetaEventInput,
  options: NormalizeOptions = {},
): MetaEventInput => {
  const eventName = sanitizeString(payload.eventName) || 'PageView'
  const eventTime = resolveEventTime(payload.eventTime)
  const actionSource = sanitizeString(payload.actionSource) ?? options.defaultActionSource ?? DEFAULT_ACTION_SOURCE
  const eventSourceUrl = resolveEventSourceUrl(payload.eventSourceUrl, options.eventSourceUrl)
  const userAgent = options.userAgent ?? getNavigatorUserAgent()
  const userData = normaliseUserData(payload.userData, userAgent)
  const customData = normaliseCustomData(payload.customData)
  const content = normaliseContent(payload.content)
  const attributionData = normaliseAttributionData(payload.attributionData)
  const originalEventData = normaliseOriginalEventData(payload.originalEventData)
  const testEventCode = sanitizeString(payload.testEventCode ?? options.defaultTestEventCode)

  const normalised: MetaEventInput = {
    eventName,
    eventTime,
    actionSource,
    userData,
    customData,
    content,
  }

  if (eventSourceUrl) {
    normalised.eventSourceUrl = eventSourceUrl
  }

  if (attributionData) {
    normalised.attributionData = attributionData
  }

  if (originalEventData) {
    normalised.originalEventData = originalEventData
  }

  if (testEventCode) {
    normalised.testEventCode = testEventCode
  }

  return normalised
}

const extractErrorMessage = (error: unknown): { message: string; statusCode?: number } => {
  if (error && typeof error === 'object') {
    const maybeError = error as { message?: string; response?: { status?: number; data?: unknown } }
    const responseMessageRaw = typeof maybeError.response?.data === 'string'
      ? maybeError.response.data
      : undefined
    const responseMessage = responseMessageRaw?.trim() || undefined
    const defaultMessage = typeof maybeError.message === 'string' ? maybeError.message.trim() : undefined
    const message = responseMessage || defaultMessage || 'Meta event request failed'
    return {
      message,
      statusCode: maybeError.response?.status,
    }
  }

  return { message: 'Meta event request failed' }
}

export const createMetaEventClient = (
  httpClient: Pick<AxiosInstance, 'post'> = axiosInstance,
  defaults: NormalizeOptions = {},
): MetaEventClient => {
  const baseDefaults: NormalizeOptions = {
    defaultActionSource: defaults.defaultActionSource ?? DEFAULT_ACTION_SOURCE,
    userAgent: defaults.userAgent,
    eventSourceUrl: defaults.eventSourceUrl,
    defaultTestEventCode: defaults.defaultTestEventCode,
  }

  return {
    async sendEvent(payload: MetaEventInput): Promise<MetaEventResponseBody> {
      const normalised = normalizeMetaEventInput(payload, {
        ...baseDefaults,
        userAgent: baseDefaults.userAgent ?? getNavigatorUserAgent(),
        eventSourceUrl: baseDefaults.eventSourceUrl ?? getWindowLocationHref(),
      })

      try {
        const response = await httpClient.post('/api/meta/events', normalised)
        return response.data as MetaEventResponseBody
      } catch (error) {
        const { message, statusCode } = extractErrorMessage(error)
        throw new MetaEventRequestError(message, statusCode)
      }
    },
  }
}

export const metaEventClient = createMetaEventClient()
export const sendMetaEvent = (payload: MetaEventInput) => metaEventClient.sendEvent(payload)
