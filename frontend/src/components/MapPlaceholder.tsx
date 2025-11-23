import React from 'react'

import '@/assets/css/map-placeholder.css'

interface MapPlaceholderProps {
  onShowMap: () => void
  label?: string
}

const MapPlaceholder = ({ onShowMap, label = 'Afficher la carte' }: MapPlaceholderProps) => (
  <div className="map-placeholder" role="status" aria-live="polite">
    <p className="map-placeholder__copy">Carte interactive disponible sur demande.</p>
    <button type="button" className="map-placeholder__cta" onClick={onShowMap} aria-label={label}>
      {label}
    </button>
  </div>
)

export default MapPlaceholder
