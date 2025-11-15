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
}

type MetaUserData = {
  em?: string
  ph?: string
  zp?: string
  ct?: string
  st?: string
  country?: string
  ge?: string
  db?: string
  client_ip_address?: string
  client_user_agent?: string
  fbp?: string
}

type MetaEventData = {
  event_name: CanonicalEventName
  event_time: number
  action_source: string
  event_source_url?: string
  user_data: MetaUserData
  custom_data?: Record<string, unknown>
  data_processing_options?: string[]
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
  const userData: MetaUserData = {
    em: hashEmail(payload.email),
    ph: hashPhone(payload.phone, country),
    zp: sanitizeString(payload.zip),
    ct: sanitizeString(payload.city),
    st: sanitizeString(payload.state),
    country,
    ge: sanitizeGender(payload.gender),
    db: formatDob(payload.dob),
    client_ip_address: sanitizeString(payload.ip),
    client_user_agent: sanitizeString(payload.userAgent),
    fbp: sanitizeString(payload.fbp),
  }
  return removeEmpty(userData)
}

type CustomDataBuildResult = {
  customData?: Record<string, unknown>
  dataProcessingOptions?: string[]
}

const buildCustomData = (payload: MetaEventPayload): CustomDataBuildResult => {
  const customData: Record<string, unknown> = {}
  const dataProcessingOptions = payload.customData?.dataProcessingOptions?.map((option) => option.trim()).filter(Boolean)
  if (payload.customData?.currency) {
    customData.currency = payload.customData.currency.trim().toUpperCase()
  }
  if (typeof payload.customData?.value === 'number') {
    customData.value = payload.customData.value
  }
  const orderId = sanitizeString(payload.customData?.orderId)
  if (orderId) {
    customData.order_id = orderId
  }
  if (payload.content?.ids && payload.content.ids.length > 0) {
    customData.content_ids = payload.content.ids
    customData.contents = payload.content.ids.map((id) => ({ id }))
  }
  if (payload.content?.type) {
    customData.content_type = payload.content.type
  }

  const cleaned = removeEmpty(customData)
  return {
    customData: Object.keys(cleaned).length > 0 ? cleaned : undefined,
    dataProcessingOptions,
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
    case 'ViewContent': {
      validateRequired(event.custom_data?.content_type, 'ViewContent requires content.type')
      validateRequired(event.custom_data?.content_ids, 'ViewContent requires content.ids')
      validateRequired(event.user_data.client_user_agent, 'ViewContent requires a user agent')
      break
    }
    case 'Purchase': {
      validateRequired(event.custom_data?.value, 'Purchase requires customData.value')
      validateRequired(event.custom_data?.currency, 'Purchase requires customData.currency')
      validateRequired(event.user_data.em, 'Purchase requires an email address')
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
