import axios, { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { validateMetaEventPayload, type MetaEventPayload, ZodError } from '../utils/validation'
import * as env from '../config/env.config'
import * as logger from '../common/logger'
import {
  hashEmail,
  hashPhone,
  formatDob,
  sanitizeString,
  sanitizeCountry,
  sanitizeGender,
  hashName,
} from '../utils/hash'

export type CanonicalEventName =
  | 'FormStart'
  | 'FormSubmit'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'PageView'
  | 'ViewContent'
  | 'Purchase'
  | 'Click'
  | 'Search'
  | 'Lead'

const EVENT_NAME_MAP: Record<string, CanonicalEventName> = {
  form_start: 'FormStart',
  FormStart: 'FormStart',
  form_submit: 'FormSubmit',
  FormSubmit: 'FormSubmit',
  AddToCart: 'AddToCart',
  add_to_cart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  initiate_checkout: 'InitiateCheckout',
  PageView: 'PageView',
  page_view: 'PageView',
  ViewContent: 'ViewContent',
  view_content: 'ViewContent',
  Purchase: 'Purchase',
  purchase: 'Purchase',
  Click: 'Click',
  click: 'Click',
  Search: 'Search',
  search: 'Search',
  Lead: 'Lead',
  lead: 'Lead',
}

type MetaUserData = {
  em?: string[]
  ph?: string[]
  zp?: string
  ct?: string
  st?: string
  country?: string
  ge?: string
  db?: string
  client_ip_address?: string
  client_user_agent?: string
  fbp?: string
  client_fbc?: string
  fn?: string[]
  ln?: string[]
  external_id?: string[]
}

type MetaEventData = {
  event_name: CanonicalEventName
  event_time: number
  action_source: string
  event_source_url?: string
  user_data: MetaUserData
  custom_data?: Record<string, unknown>
  data_processing_options?: string[]
  attribution_data?: Record<string, unknown>
  original_event_data?: Record<string, unknown>
}

type CustomDataInput = {
  value?: number
  currency?: string
  dataProcessingOptions?: string[]
  orderId?: string
  transactionId?: string
  contents?: Array<{
    id: string
    quantity?: number
    itemPrice?: number
    price?: number
    title?: string
    category?: string
  }>
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

type CustomContentItem = NonNullable<CustomDataInput['contents']>[number]
type MetaContentItem = {
  id: string
  quantity?: number
  item_price?: number
  price?: number
  title?: string
  category?: string
}

export type MetaEventResponse = {
  events_received?: number
  fbtrace_id?: string
  messages?: Array<{ code?: number; message: string }>
} & Record<string, unknown>

export class MetaConversionsError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

const removeEmpty = <T extends Record<string, unknown>>(value: T): T => {
  const result: Record<string, unknown> = {}
  for (const [key, current] of Object.entries(value)) {
    if (Array.isArray(current)) {
      if (current.length > 0) {
        result[key] = current
      }
    } else if (typeof current === 'number') {
      if (!Number.isNaN(current)) {
        result[key] = current
      }
    } else if (typeof current === 'boolean') {
      result[key] = current
    } else if (current) {
      result[key] = current
    }
  }
  return result as T
}

const sanitizeStringArray = (values?: string[] | null): string[] | undefined => {
  if (!values) {
    return undefined
  }
  const cleaned = values
    .map((value) => sanitizeString(value))
    .filter((value): value is string => Boolean(value))
  return cleaned.length > 0 ? cleaned : undefined
}

const toMetaArray = (value?: string): string[] | undefined => {
  if (!value) {
    return undefined
  }
  return [value]
}

const toFiniteNumber = (value?: number): number | undefined => {
  if (typeof value !== 'number') {
    return undefined
  }
  if (!Number.isFinite(value)) {
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

const buildContents = (items?: CustomContentItem[]): MetaContentItem[] | undefined => {
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
      const metaItem: MetaContentItem = { id }
      if (quantity) {
        metaItem.quantity = quantity
      }
      if (price !== undefined) {
        metaItem.item_price = price
        metaItem.price = price
      }
      const title = sanitizeString(item.title)
      if (title) {
        metaItem.title = title
      }
      const category = sanitizeString(item.category)
      if (category) {
        metaItem.category = category
      }
      return metaItem
    })
    .filter((item): item is MetaContentItem => Boolean(item))
  return mapped.length > 0 ? mapped : undefined
}

const buildFilters = (filters?: Record<string, unknown>): Record<string, unknown> | undefined => {
  if (!filters) {
    return undefined
  }
  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      cleaned[key] = value
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

const buildAttributionData = (
  data?: MetaEventPayload['attributionData'],
): Record<string, unknown> | undefined => {
  if (!data) {
    return undefined
  }
  const attribution: Record<string, unknown> = {
    attribution_share: typeof data.attributionShare === 'number'
      ? data.attributionShare
      : sanitizeString(data.attributionShare),
    ad_id: sanitizeString(data.adId),
    campaign_id: sanitizeString(data.campaignId),
    click_id: sanitizeString(data.clickId),
    engagement_time: typeof data.engagementTime === 'number'
      ? data.engagementTime
      : sanitizeString(data.engagementTime as string | undefined),
  }
  const cleaned = removeEmpty(attribution)
  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

const buildOriginalEventData = (
  data: MetaEventPayload['originalEventData'] | undefined,
  fallbackName: CanonicalEventName,
  fallbackTime: number,
): Record<string, unknown> | undefined => {
  const original: Record<string, unknown> = {
    event_name: sanitizeString(data?.eventName) ?? fallbackName,
    event_time:
      typeof data?.eventTime === 'number' && Number.isFinite(data.eventTime)
        ? Math.floor(data.eventTime)
        : fallbackTime,
  }
  return removeEmpty(original)
}

const toCanonicalEventName = (eventName: string): CanonicalEventName => {
  const key = eventName.trim()
  const canonical = EVENT_NAME_MAP[key]
  if (!canonical) {
    throw new MetaConversionsError(`Unsupported event: ${eventName}`, 400)
  }
  return canonical
}

const buildUserData = (payload?: MetaEventPayload['userData']): MetaUserData => {
  if (!payload) {
    return {}
  }
  const country = sanitizeCountry(payload.country)
  const emailHash = hashEmail(payload.email)
  const phoneHash = hashPhone(payload.phone, country)
  const zip = sanitizeString(payload.zip)
  const city = sanitizeString(payload.city)
  const state = sanitizeString(payload.state)
  const gender = sanitizeGender(payload.gender)
  const dob = formatDob(payload.dob)
  const firstNameHash = hashName(payload.firstName)
  const lastNameHash = hashName(payload.lastName)
  const externalId = sanitizeString(payload.externalId)
  const userData: MetaUserData = {
    em: toMetaArray(emailHash),
    ph: toMetaArray(phoneHash),
    zp: zip,
    ct: city,
    st: state,
    country,
    ge: gender,
    db: dob,
    client_ip_address: sanitizeString(payload.ip),
    client_user_agent: sanitizeString(payload.userAgent),
    fbp: sanitizeString(payload.fbp),
    client_fbc: sanitizeString(payload.fbc),
    fn: toMetaArray(firstNameHash),
    ln: toMetaArray(lastNameHash),
    external_id: toMetaArray(externalId),
  }
  return removeEmpty(userData)
}

type CustomDataBuildResult = {
  customData?: Record<string, unknown>
  dataProcessingOptions?: string[]
}

const buildCustomData = (payload: MetaEventPayload): CustomDataBuildResult => {
  const customData: Record<string, unknown> = {}
  const dataProcessingOptions = sanitizeStringArray(payload.customData?.dataProcessingOptions)

  const currency = sanitizeString(payload.customData?.currency)?.toUpperCase()
  if (currency) {
    customData.currency = currency
  }

  const value = toPrice(payload.customData?.value)
  if (value !== undefined) {
    customData.value = value
  }

  const orderId = sanitizeString(payload.customData?.orderId)
  if (orderId) {
    customData.order_id = orderId
  }

  const transactionId = sanitizeString(payload.customData?.transactionId)
  if (transactionId) {
    customData.transaction_id = transactionId
  }

  const contents = buildContents(payload.customData?.contents)
  if (contents) {
    customData.contents = contents
  }

  const explicitContentIds = sanitizeStringArray(payload.customData?.contentIds)
  const fallbackContentIds = sanitizeStringArray(payload.content?.ids)
  const contentIds = explicitContentIds ?? fallbackContentIds ?? contents?.map((item) => item.id)
  if (contentIds && contentIds.length > 0) {
    customData.content_ids = contentIds
  }

  const explicitContentType = sanitizeString(payload.customData?.contentType)
  const fallbackContentType = sanitizeString(payload.content?.type)
  const contentType = explicitContentType ?? fallbackContentType
  if (contentType) {
    customData.content_type = contentType
  }

  const explicitNumItems = toPositiveInteger(payload.customData?.numItems)
  let computedNumItems: number | undefined
  if (!explicitNumItems && Array.isArray(contents)) {
    computedNumItems = contents.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
    if (computedNumItems <= 0) {
      computedNumItems = undefined
    }
  }
  const numItems = explicitNumItems ?? computedNumItems
  if (numItems) {
    customData.num_items = numItems
  }

  const coupon = sanitizeString(payload.customData?.coupon)
  if (coupon) {
    customData.coupon = coupon
  }

  const pageLocation = sanitizeString(payload.customData?.pageLocation)
  if (pageLocation) {
    customData.page_location = pageLocation
  }

  const pageTitle = sanitizeString(payload.customData?.pageTitle)
  if (pageTitle) {
    customData.page_title = pageTitle
  }

  const searchString = sanitizeString(payload.customData?.searchString)
  if (searchString) {
    customData.search_string = searchString
  }

  const searchTerm = sanitizeString(payload.customData?.searchTerm)
  if (searchTerm) {
    customData.search_term = searchTerm
  }

  const pickupLocationId = sanitizeString(payload.customData?.pickupLocationId)
  if (pickupLocationId) {
    customData.pickup_location_id = pickupLocationId
  }

  const dropOffLocationId = sanitizeString(payload.customData?.dropOffLocationId)
  if (dropOffLocationId) {
    customData.dropoff_location_id = dropOffLocationId
  }

  const startDate = sanitizeString(payload.customData?.startDate)
  if (startDate) {
    customData.start_date = startDate
  }

  const endDate = sanitizeString(payload.customData?.endDate)
  if (endDate) {
    customData.end_date = endDate
  }

  if (typeof payload.customData?.sameLocation === 'boolean') {
    customData.same_location = payload.customData.sameLocation
  }

  const filters = buildFilters(payload.customData?.filters)
  if (filters) {
    customData.filters = filters
  }

  const leadSource = sanitizeString(payload.customData?.leadSource)
  if (leadSource) {
    customData.lead_source = leadSource
  }

  if (typeof payload.customData?.hasEmail === 'boolean') {
    customData.has_email = payload.customData.hasEmail
  }

  const subject = sanitizeString(payload.customData?.subject)
  if (subject) {
    customData.subject = subject
  }

  const messageLength = toPositiveInteger(payload.customData?.messageLength)
  if (messageLength !== undefined) {
    customData.message_length = messageLength
  }

  if (typeof payload.customData?.isAuthenticated === 'boolean') {
    customData.is_authenticated = payload.customData.isAuthenticated
  }

  const cleaned = removeEmpty(customData)
  return {
    customData: Object.keys(cleaned).length > 0 ? cleaned : undefined,
    dataProcessingOptions: dataProcessingOptions && dataProcessingOptions.length > 0 ? dataProcessingOptions : undefined,
  }
}

const validateRequired = (value: unknown, message: string): void => {
  if (value === undefined || value === null || value === '') {
    throw new MetaConversionsError(message, 400)
  }
}

const validateUrl = (value: string | undefined, message: string): void => {
  validateRequired(value, message)
  if (value) {
    try {
      // eslint-disable-next-line no-new
      new URL(value)
    } catch {
      throw new MetaConversionsError(message, 400)
    }
  }
}

const buildEvent = (canonicalName: CanonicalEventName, payload: MetaEventPayload): MetaEventData => {
  const eventTime = payload.eventTime ?? Math.floor(Date.now() / 1000)
  const actionSource = sanitizeString(payload.actionSource) || 'website'
  const eventSourceUrl = sanitizeString(payload.eventSourceUrl)
  const userData = buildUserData(payload.userData)
  const { customData, dataProcessingOptions } = buildCustomData(payload)

  const event: MetaEventData = {
    event_name: canonicalName,
    event_time: eventTime,
    action_source: actionSource,
    user_data: userData,
  }

  if (eventSourceUrl) {
    event.event_source_url = eventSourceUrl
  }
  if (customData) {
    event.custom_data = customData
  }
  if (dataProcessingOptions && dataProcessingOptions.length > 0) {
    event.data_processing_options = dataProcessingOptions
  }

  const attributionData = buildAttributionData(payload.attributionData)
  if (attributionData) {
    event.attribution_data = attributionData
  }

  const originalEventData = buildOriginalEventData(payload.originalEventData, canonicalName, eventTime)
  if (originalEventData) {
    event.original_event_data = originalEventData
  }

  switch (canonicalName) {
    case 'FormStart':
    case 'FormSubmit': {
      validateUrl(event.event_source_url, `${canonicalName} requires an eventSourceUrl`)
      validateRequired(event.user_data.client_user_agent, `${canonicalName} requires a user agent`)
      validateRequired(event.user_data.em, `${canonicalName} requires an email address`)
      break
    }
    case 'AddToCart': {
      validateRequired(event.custom_data?.content_type, 'AddToCart requires content.type')
      validateRequired(event.custom_data?.content_ids, 'AddToCart requires content.ids')
      validateRequired(event.user_data.client_user_agent, 'AddToCart requires a user agent')
      break
    }
    case 'InitiateCheckout': {
      validateUrl(event.event_source_url, 'InitiateCheckout requires an eventSourceUrl')
      validateRequired(event.user_data.client_user_agent, 'InitiateCheckout requires a user agent')
      break
    }
    case 'PageView': {
      validateUrl(event.event_source_url, 'PageView requires an eventSourceUrl')
      validateRequired(event.user_data.client_user_agent, 'PageView requires a user agent')
      break
    }
    case 'Search': {
      validateUrl(event.event_source_url, 'Search requires an eventSourceUrl')
      validateRequired(event.user_data.client_user_agent, 'Search requires a user agent')
      validateRequired(event.custom_data?.search_string, 'Search requires customData.searchString')
      break
    }
    case 'ViewContent': {
      validateRequired(event.custom_data?.content_type, 'ViewContent requires content.type')
      validateRequired(event.custom_data?.content_ids, 'ViewContent requires content.ids')
      validateRequired(event.user_data.client_user_agent, 'ViewContent requires a user agent')
      break
    }
    case 'Purchase': {
      validateRequired(event.custom_data?.value, 'Purchase requires customData.value')
      validateRequired(event.custom_data?.currency, 'Purchase requires customData.currency')
      if (!event.user_data.em && !event.user_data.ph) {
        throw new MetaConversionsError('Purchase requires at least an email or phone number', 400)
      }
      break
    }
    case 'Lead': {
      validateRequired(event.user_data.client_user_agent, 'Lead requires a user agent')
      if (!event.user_data.em && !event.user_data.ph) {
        throw new MetaConversionsError('Lead requires at least an email or phone number', 400)
      }
      break
    }
    case 'Click': {
      validateRequired(event.user_data.client_user_agent, 'Click requires a user agent')
      break
    }
    default:
      break
  }

  return event
}

const getAccessToken = (): string => {
  const token = env.META_PIXEL_TOKEN
  if (!token) {
    throw new MetaConversionsError('META_PIXEL_TOKEN is not configured', 500)
  }
  return token
}

const getPixelId = (): string => {
  const pixelId = env.META_PIXEL_ID
  if (!pixelId) {
    throw new MetaConversionsError('META_PIXEL_ID is not configured', 500)
  }
  return pixelId
}

const getApiVersion = (): string => env.META_API_VERSION || 'v21.0'

export const sendMetaEvent = async (input: MetaEventPayload): Promise<MetaEventResponse> => {
  let parsed: MetaEventPayload
  try {
    parsed = validateMetaEventPayload(input)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new MetaConversionsError(error.issues[0]?.message || 'Invalid payload', 400)
    }
    throw error
  }

  const canonicalName = toCanonicalEventName(parsed.eventName)
  const event = buildEvent(canonicalName, parsed)

  const accessToken = getAccessToken()
  const pixelId = getPixelId()
  const endpoint = `https://graph.facebook.com/${getApiVersion()}/${pixelId}/events`

  const payload = {
    data: [event],
  }

  if (parsed.testEventCode) {
    Object.assign(payload, { test_event_code: parsed.testEventCode })
  }

  try {
    const response: AxiosResponse<MetaEventResponse> = await axios.post(endpoint, payload, {
      params: { access_token: accessToken },
    })
    logger.info(`[metaConversions] Event ${canonicalName} sent`, {
      event: canonicalName,
      endpoint,
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data || error.message
      logger.error(`[metaConversions] Failed to send ${canonicalName}`, message)
      throw new MetaConversionsError('Meta Conversions API request failed', error.response?.status || 502)
    }
    logger.error(`[metaConversions] Unexpected error sending ${canonicalName}`, error)
    throw new MetaConversionsError('Unexpected error when sending event', 500)
  }
}

export type SendMetaEventInput = MetaEventPayload
