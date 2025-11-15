import type { Location } from 'react-router-dom'
import {
  MetaEventRequestError,
  type MetaEventClient,
  type MetaEventInput,
  type MetaEventResponseBody,
} from '@/services/MetaEventService'

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
}

export const createTrackPageViewHandler = ({
  trackEvent,
  resolveHref,
}: TrackPageViewDeps) =>
  async (overrides?: Partial<MetaEventInput>): Promise<MetaEventResponseBody> => {
    const eventSourceUrl = overrides?.eventSourceUrl ?? resolveHref()
    return trackEvent({
      ...overrides,
      eventName: 'PageView',
      eventSourceUrl,
    })
  }

export { FALLBACK_ORIGIN }
