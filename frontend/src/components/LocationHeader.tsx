import React from 'react'
import * as bookcarsTypes from ':bookcars-types'

import '@/assets/css/location-header.css'

interface LocationHeaderProps {
  location: bookcarsTypes.Location
}

const LocationHeader = ({ location }: LocationHeaderProps) => (
  <header className="location-header">
    <p className="location-header__eyebrow">Louez une voiture à</p>
    <h1 className="location-header__title">{location.name}</h1>
    <p className="location-header__subtitle">
      Location voiture
      {' '}
      {location?.name && `à ${location.name}`}
      , trouvez la voiture idéale pour vos déplacements en Tunisie. Nous proposons des véhicules de qualité à des prix compétitifs.
    </p>
  </header>
)

export default LocationHeader
