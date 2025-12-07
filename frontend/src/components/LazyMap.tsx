import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'

import MapSkeleton from './MapSkeleton'
import type { MapProps } from './Map'
import {
  createDeferredLoader,
  isIntersectionObserverAvailable,
  shouldLoadMapImmediately,
} from './map/lazyMap.utils'

const LeafletMap = lazy(async () => {
  const module = await import('./Map')
  await import('leaflet/dist/leaflet.css')
  return module
})

interface LazyMapProps extends MapProps {
  rootMargin?: string
}

const LazyMap: React.FC<LazyMapProps> = ({ rootMargin = '320px', ...props }) => {
  const [shouldLoad, setShouldLoad] = useState(
    shouldLoadMapImmediately() || !isIntersectionObserverAvailable()
  )
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (shouldLoad) {
      return () => undefined
    }

    const { observer, fallbackTimer } = createDeferredLoader({
      target: wrapperRef.current,
      rootMargin,
      onIntersect: () => setShouldLoad(true),
      onTimeout: () => setShouldLoad(true),
    })

    return () => {
      if (observer) {
        observer.disconnect()
      }

      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer)
      }
    }
  }, [rootMargin, shouldLoad])

  return (
    <div className="map-lazy-wrapper" ref={wrapperRef} data-testid="lazy-map">
      {shouldLoad ? (
        <Suspense
          fallback={
            <MapSkeleton title={props.title} description={props.description} animate />
          }
        >
          <LeafletMap {...props} />
        </Suspense>
      ) : (
        <MapSkeleton title={props.title} description={props.description} animate />
      )}
    </div>
  )
}

export default LazyMap
