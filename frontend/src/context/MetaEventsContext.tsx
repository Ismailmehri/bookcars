import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'
import {
  createMetaEventClient,
  type MetaEventClient,
  type MetaEventInput,
  type MetaEventResponseBody,
} from '@/services/MetaEventService'
import { strings as commonStrings } from '@/lang/common'
import {
  buildHrefFromLocation,
  createTrackEventHandler,
  createTrackPageViewHandler,
  type MetaEventStatus,
} from '@/context/metaEvents.helpers'

export type { MetaEventStatus } from '@/context/metaEvents.helpers'

export interface MetaEventsContextValue {
  status: MetaEventStatus
  lastEventName?: string
  error?: string
  testEventCode?: string
  trackEvent: (payload: MetaEventInput) => Promise<MetaEventResponseBody>
  trackPageView: (overrides?: Partial<MetaEventInput>) => Promise<MetaEventResponseBody>
  reset: () => void
  setTestEventCode: (code?: string) => void
}

const MetaEventsContext = createContext<MetaEventsContextValue | undefined>(undefined)

export interface MetaEventsProviderProps {
  children: ReactNode
  autoTrackPageViews?: boolean
  client?: MetaEventClient
  testEventCode?: string
}

export const MetaEventsProvider = ({
  children,
  autoTrackPageViews = true,
  client,
  testEventCode,
}: MetaEventsProviderProps) => {
  const [status, setStatus] = useState<MetaEventStatus>('idle')
  const [lastEventName, setLastEventName] = useState<string>()
  const [error, setError] = useState<string>()
  const [overrideTestCode, setOverrideTestCode] = useState<string | undefined>(testEventCode)
  const location = useLocation()
  const lastTrackedUrl = useRef<string>()

  const metaClient = useMemo(() => client ?? createMetaEventClient(undefined, { defaultTestEventCode: testEventCode }), [client, testEventCode])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(undefined)
    setLastEventName(undefined)
  }, [])

  const setTestEventCode = useCallback((code?: string) => {
    const trimmed = typeof code === 'string' ? code.trim() : undefined
    setOverrideTestCode(trimmed && trimmed.length > 0 ? trimmed : undefined)
  }, [])

  const trackEvent = useMemo(
    () =>
      createTrackEventHandler({
        metaClient,
        getOverrideTestCode: () => overrideTestCode,
        setStatus,
        setError,
        setLastEventName,
      }),
    [metaClient, overrideTestCode],
  )

  const trackPageView = useMemo(
    () =>
      createTrackPageViewHandler({
        trackEvent,
        resolveHref: () => buildHrefFromLocation(location),
      }),
    [location, trackEvent],
  )

  useEffect(() => {
    if (!autoTrackPageViews) {
      return
    }

    const href = buildHrefFromLocation(location)
    if (href === lastTrackedUrl.current) {
      return
    }

    lastTrackedUrl.current = href
    trackPageView({ eventSourceUrl: href }).catch(() => undefined)
  }, [autoTrackPageViews, location, trackPageView])

  const value = useMemo<MetaEventsContextValue>(() => ({
    status,
    lastEventName,
    error,
    testEventCode: overrideTestCode,
    trackEvent,
    trackPageView,
    reset,
    setTestEventCode,
  }), [error, lastEventName, overrideTestCode, reset, setTestEventCode, status, trackEvent, trackPageView])

  const loadingAnnouncement = status === 'loading' ? commonStrings.META_EVENT_SENDING : ''
  const errorAnnouncement = status === 'error' ? error || commonStrings.META_EVENT_ERROR : ''

  return (
    <MetaEventsContext.Provider value={value}>
      <>
        <span aria-live="polite" className="meta-event-announcement" role="status">
          {loadingAnnouncement}
        </span>
        <span aria-live="assertive" className="meta-event-announcement" role="alert">
          {errorAnnouncement}
        </span>
        {children}
      </>
    </MetaEventsContext.Provider>
  )
}

/* eslint-disable-next-line react-refresh/only-export-components */
export const useMetaEvents = () => {
  const context = useContext(MetaEventsContext)
  if (!context) {
    throw new Error('useMetaEvents must be used within MetaEventsProvider')
  }
  return context
}

/* eslint-disable-next-line react-refresh/only-export-components */
export const useMetaEventsStatus = () => {
  const { status, lastEventName, error } = useMetaEvents()
  return { status, lastEventName, error }
}
