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
}

export interface MetaEventCustomData {
  value?: number
  currency?: string
  dataProcessingOptions?: string[]
  orderId?: string
}

export interface MetaEventContent {
  ids?: string[]
  type?: string
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
  }

  return removeEmpty(normalised)
}

const normaliseCustomData = (customData?: MetaEventCustomData): MetaEventCustomData | undefined => {
  if (!customData) {
    return undefined
  }

  const dataProcessingOptions = sanitizeStringArray(customData.dataProcessingOptions)

  const normalised: MetaEventCustomData = {
    value: typeof customData.value === 'number' && Number.isFinite(customData.value)
      ? customData.value
      : undefined,
    currency: sanitizeString(customData.currency)?.toUpperCase(),
    dataProcessingOptions,
    orderId: sanitizeString(customData.orderId),
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
