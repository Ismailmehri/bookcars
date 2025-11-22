import React, { Suspense } from 'react'
import type { MapProps } from './Map'

const MapView = React.lazy(() => import('./Map'))

interface MapLazyProps extends MapProps {
  show: boolean
  fallback?: React.ReactNode
  placeholderLabel?: string
}

const MapLazy = ({ show, fallback, placeholderLabel, ...rest }: MapLazyProps) => (
  <div className="map-lazy-shell">
    {!show && (
      <div className="map-placeholder" aria-hidden="true">
        <div className="map-placeholder__grid" />
        <span className="map-placeholder__label">{placeholderLabel ?? 'Carte en attente…'}</span>
      </div>
    )}
    <Suspense fallback={fallback ?? <div className="map-loading" role="status">Chargement de la carte…</div>}>
      {show ? <MapView {...rest} /> : null}
    </Suspense>
  </div>
)

export default React.memo(MapLazy)
