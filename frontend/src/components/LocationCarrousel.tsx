import React, { ReactNode, useMemo, useRef } from 'react'
import Slider from 'react-slick'
import {
  ArrowRight,
  ArrowLeft,
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import * as bookcarsHelper from ':bookcars-helper'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'
import { strings } from '@/lang/location-carrousel'
import { strings as commonStrings } from '@/lang/common'
import Badge from './Badge'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import '@/assets/css/location-carrousel.css'

interface LocationCarrouselProps {
  locations: bookcarsTypes.Location[]
  loading?: boolean
  error?: string
  onRetry?: () => void
  onSelect?: (location: bookcarsTypes.Location) => void
}

const LocationCarrousel = ({
  locations,
  loading = false,
  error,
  onRetry,
  onSelect,
}: LocationCarrouselProps) => {
  const slider = useRef<Slider>(null)

  const sliderSettings = useMemo(() => ({
    arrows: false,
    dots: true,
    // eslint-disable-next-line react/no-unstable-nested-components
    appendDots: (dots: ReactNode) => (
      <div className="location-carousel__pagination">
        <button type="button" className="location-carousel__pager" onClick={() => slider?.current?.slickPrev()}>
          <ArrowLeft />
          {commonStrings.BACK}
        </button>
        {dots}
        <button type="button" className="location-carousel__pager" onClick={() => slider?.current?.slickNext()}>
          {commonStrings.NEXT}
          <ArrowRight />
        </button>
      </div>
    ),
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    variableWidth: true,
    responsive: [
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          variableWidth: false,
        }
      }
    ]
  }), [])

  if (loading) {
    return (
      <div className="location-carousel__status" aria-live="polite" role="status">
        <div className="location-carousel__spinner" />
        <span>{strings.LOADING}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="location-carousel__status location-carousel__status--error" role="alert">
        <span>{error}</span>
        {onRetry && (
          <button type="button" className="location-carousel__retry" onClick={onRetry}>
            {commonStrings.TRY_AGAIN}
          </button>
        )}
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="location-carousel__status" aria-live="polite">
        {strings.EMPTY_STATE}
      </div>
    )
  }

  return (
    <section className="location-carousel" aria-label={strings.ARIA_LABEL}>
      <Slider ref={slider} {...sliderSettings}>
        {locations.map((location) => (
          <div key={location._id} className="location-carousel__card">
            <div className="location-carousel__media">
              {location.image ? (
                <img
                  alt={location.name}
                  src={bookcarsHelper.joinURL(env.CDN_LOCATIONS, location.image)}
                  loading="lazy"
                />
              ) : (
                <LocationIcon className="location-carousel__icon" />
              )}
            </div>
            <div className="location-carousel__header">
              <h2>{location.name}</h2>
              <Badge backgroundColor="#B3E5FC" color="#2D7AB3" text="New" />
            </div>
            <p className="location-carousel__meta">
              {`${location.name}${location.parkingSpots && location.parkingSpots?.length > 0 ? ` · ${location.parkingSpots?.length} ${location.parkingSpots?.length === 1 ? strings.AVALIABLE_LOCATION : strings.AVALIABLE_LOCATIONS}` : ''}`}
            </p>
            <button
              type="button"
              className="location-carousel__cta"
              onClick={() => onSelect?.(location)}
            >
              {strings.SELECT_LOCATION}
            </button>
          </div>
        ))}
      </Slider>
    </section>
  )
}

export default LocationCarrousel
