import React, { useMemo } from 'react'
import Slider from 'react-slick'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import '@/assets/css/supplier-carrousel.css'

interface SupplierCarrouselProps {
  suppliers: bookcarsTypes.User[]
  loading?: boolean
  error?: string
  onRetry?: () => void
}

const baseSettings = {
  infinite: true,
  speed: 3 * 1000,
  slidesToShow: env.isMobile() ? 2 : 6,
  autoplay: true,
  autoplaySpeed: 3 * 1000,
  centerMode: true,
  arrows: false,
  dots: false,
  touchMove: false,
  centerPadding: '64px',
}

const SupplierCarrousel = ({ suppliers, loading = false, error, onRetry }: SupplierCarrouselProps) => {
  const filteredSuppliers = useMemo(
    () => suppliers.filter((supplier) => (supplier.carCount || 0) > 0 && supplier.active && supplier.verified)
      .sort((a, b) => (b.carCount || 0) - (a.carCount || 0)),
    [suppliers]
  )

  if (loading) {
    return (
      <div className="supplier-carousel__status" aria-live="polite" role="status">
        <div className="supplier-carousel__spinner" />
        <span>Chargement des partenaires...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="supplier-carousel__status supplier-carousel__status--error" role="alert">
        <span>{error}</span>
        {onRetry && (
          <button type="button" className="supplier-carousel__retry" onClick={onRetry}>
            Réessayer
          </button>
        )}
      </div>
    )
  }

  if (filteredSuppliers.length === 0) {
    return (
      <div className="supplier-carousel__status" aria-live="polite">
        Aucun partenaire disponible pour le moment.
      </div>
    )
  }

  return (
    <section className="supplier-carousel" aria-label="Partenaires vérifiés">
      <Slider {...baseSettings}>
        {filteredSuppliers.map((supplier) => (
          <div key={supplier._id} className="supplier-carousel__slide">
            <figure className="supplier-carousel__logo" aria-label={supplier.fullName}>
              <img
                src={bookcarsHelper.joinURL(env.CDN_USERS, supplier.avatar)}
                alt={supplier.fullName}
                title={supplier.fullName}
                loading="lazy"
              />
            </figure>
          </div>
        ))}
      </Slider>
    </section>
  )
}

export default SupplierCarrousel
