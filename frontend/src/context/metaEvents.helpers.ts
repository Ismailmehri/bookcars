import type { Location } from 'react-router-dom'
import {
  MetaEventRequestError,
  type MetaEventClient,
  type MetaEventInput,
  type MetaEventResponseBody,
  generateEventId,
} from '@/services/MetaEventService'
import {
  buildMetaUserData as buildMetaUserDataFromGtm,
  getCurrentUserContext as getCurrentUserContextFromGtm,
  resolveEventSourceUrl as resolveEventSourceUrlFromGtm,
} from '@/common/gtm'

export type MetaEventStatus = 'idle' | 'loading' | 'success' | 'error'

const FALLBACK_ORIGIN = 'https://plany.tn'

const getWindowHref = (): string | undefined => {
  if (typeof window !== 'undefined' && window.location?.href) {
    return window.location.href
  }
  return undefined
}

export const buildHrefFromLocation = (location: Pick<Location, 'pathname' | 'search' | 'hash'>): string => {
  const hrefFromWindow = getWindowHref()
  if (hrefFromWindow) {
    return hrefFromWindow
  }

  const origin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : FALLBACK_ORIGIN

  return `${origin}${location.pathname}${location.search}${location.hash}`
}

export type TrackEventDeps = {
  metaClient: MetaEventClient
  getOverrideTestCode: () => string | undefined
  setStatus: (status: MetaEventStatus) => void
  setError: (value?: string) => void
  setLastEventName: (name?: string) => void
}

export const createTrackEventHandler = ({
  metaClient,
  getOverrideTestCode,
  setStatus,
  setError,
  setLastEventName,
}: TrackEventDeps) =>
  async (payload: MetaEventInput): Promise<MetaEventResponseBody> => {
    const nextPayload: MetaEventInput = {
      ...payload,
    }

    const overrideTestCode = getOverrideTestCode()
    if (overrideTestCode && !nextPayload.testEventCode) {
      nextPayload.testEventCode = overrideTestCode
    }

    if (!nextPayload.eventId) {
      nextPayload.eventId = generateEventId()
    }

    setStatus('loading')
    setError(undefined)
    setLastEventName(payload.eventName)

    try {
      const response = await metaClient.sendEvent(nextPayload)
      if (response.success) {
        setStatus('success')
        return response
      }

      setStatus('error')
      setError(response.error || 'Meta event rejected')
      return response
    } catch (err) {
      const message = err instanceof MetaEventRequestError ? err.message : err instanceof Error ? err.message : 'Meta event request failed'
      setStatus('error')
      setError(message)
      return { success: false, error: message }
    }
  }

export type TrackPageViewDeps = {
  trackEvent: (payload: MetaEventInput) => Promise<MetaEventResponseBody>
  resolveHref: () => string
  buildUserData?: (overrides?: MetaEventInput['userData']) => MetaEventInput['userData'] | undefined
  getUserContext?: () => { isAuthenticated: boolean }
  resolveEventSourceUrl?: (url?: string) => string | undefined
}

export const createTrackPageViewHandler = ({
  trackEvent,
  resolveHref,
  buildUserData = buildMetaUserDataFromGtm,
  getUserContext = getCurrentUserContextFromGtm,
  resolveEventSourceUrl = resolveEventSourceUrlFromGtm,
}: TrackPageViewDeps) =>
  async (overrides?: Partial<MetaEventInput>): Promise<MetaEventResponseBody> => {
    const baseHref = resolveHref()
    const derivedEventSourceUrl = resolveEventSourceUrl(overrides?.eventSourceUrl ?? baseHref) ?? baseHref
    const userContext = getUserContext()
    const documentTitle = typeof document !== 'undefined' && typeof document.title === 'string'
      ? document.title.trim()
      : undefined

    const customData: MetaEventInput['customData'] = { ...(overrides?.customData ?? {}) }

    const overridePageLocation = typeof customData.pageLocation === 'string' ? customData.pageLocation.trim() : undefined
    if (overridePageLocation) {
      customData.pageLocation = overridePageLocation
    } else {
      customData.pageLocation = derivedEventSourceUrl
    }

    const overridePageTitle = typeof customData.pageTitle === 'string' ? customData.pageTitle.trim() : undefined
    if (overridePageTitle) {
      customData.pageTitle = overridePageTitle
    } else if (documentTitle) {
      customData.pageTitle = documentTitle
    } else {
      delete customData.pageTitle
    }

    if (typeof customData.isAuthenticated !== 'boolean') {
      customData.isAuthenticated = Boolean(userContext?.isAuthenticated)
    }

    const nextPayload: MetaEventInput = {
      ...overrides,
      eventName: 'PageView',
      eventSourceUrl: derivedEventSourceUrl,
      customData,
    }

    const userData = buildUserData(overrides?.userData)
    if (userData) {
      nextPayload.userData = userData
    }

    if (!nextPayload.eventId) {
      nextPayload.eventId = generateEventId()
    }

    return trackEvent(nextPayload)
  }

export { FALLBACK_ORIGIN }
