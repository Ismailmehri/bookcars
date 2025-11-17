import React, { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { MapProps } from './Map'
import { shouldRenderLazyContent } from '@/common/visibility'

import '@/assets/css/lazy-map.css'

const Map = lazy(() => import('./Map'))

const FALLBACK_IDLE_MS = 1200

export type LazyMapProps = MapProps & { skeletonHeight?: number }

const LazyMap = ({ skeletonHeight = 540, ...props }: LazyMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hasIntersected, setHasIntersected] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const startedAt = Date.now()
    const target = containerRef.current
    let idleTimer: ReturnType<typeof window.setTimeout> | undefined
    let observer: IntersectionObserver | undefined

    const activate = () => {
      setHasIntersected(true)
      setShouldRender(true)
      if (observer) {
        observer.disconnect()
      }
    }

    if (typeof window === 'undefined') {
      activate()
      return undefined
    }

    if ('IntersectionObserver' in window && target) {
      observer = new IntersectionObserver((entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)

        if (shouldRenderLazyContent({ hasIntersected, idleMs: FALLBACK_IDLE_MS, startedAt, isIntersecting })) {
          activate()
        }
      }, {
        root: null,
        rootMargin: '256px 0px 256px 0px',
        threshold: [0, 0.1, 0.25, 0.5],
      })

      observer.observe(target)
    } else {
      activate()
    }

    idleTimer = window.setTimeout(() => {
      if (!hasIntersected) {
        activate()
      }
    }, FALLBACK_IDLE_MS)

    return () => {
      if (observer) {
        observer.disconnect()
      }
      if (idleTimer) {
        window.clearTimeout(idleTimer)
      }
    }
  }, [hasIntersected])

  return (
    <div ref={containerRef} className="lazy-map-wrapper" aria-busy={!shouldRender}>
      {shouldRender ? (
        <Suspense fallback={<div className="map-skeleton" style={{ minHeight: skeletonHeight }} aria-hidden />}>
          <Map {...props} />
        </Suspense>
      ) : (
        <div className="map-skeleton" style={{ minHeight: skeletonHeight }} aria-hidden />
      )}
    </div>
  )
}

export default LazyMap
