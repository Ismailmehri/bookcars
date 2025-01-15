import React from 'react'
import Slider from 'react-slick'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import '@/assets/css/supplier-carrousel.css'

interface SupplierCarrouselProps {
  suppliers: bookcarsTypes.User[];
}

const settings = {
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

const SupplierCarrousel = ({ suppliers }: SupplierCarrouselProps) => {
  // Filtrer les fournisseurs avec au moins une voiture (carCount > 0)
  const filteredSuppliers = suppliers.filter((supplier) => (supplier.carCount || 0) > 0 && supplier.active && supplier.verified)

  // Trier les fournisseurs par nombre de voitures (carCount) en ordre décroissant
  filteredSuppliers.sort((a, b) => (b.carCount || 0) - (a.carCount || 0))

  return (
    <Slider {...settings} className="supplier-carrousel">
      {filteredSuppliers.map((supplier) => (
        <div key={supplier._id}>
          <div className="supplier-container">
            <img
              src={bookcarsHelper.joinURL(env.CDN_USERS, supplier.avatar)}
              alt={supplier.fullName}
              title={supplier.fullName}
            />
          </div>
        </div>
      ))}
    </Slider>
  )
}

export default SupplierCarrousel
