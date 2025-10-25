import React from 'react'
import {
  Avatar,
  Button,
  Chip,
  Rating,
  Tooltip,
  Skeleton,
} from '@mui/material'
import {
  DirectionsCar as BodyTypeIcon,
  Settings as GearboxIcon,
  AirlineSeatReclineNormal as SeatsIcon,
  AcUnit as AirconIcon,
  Speed as MileageIcon,
  LocalGasStation as FuelPolicyIcon,
  Check as CheckIcon,
  Clear as UncheckIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import * as helper from '@/common/helper'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/cars'
import { transformScore, getAvailabilityDisplay } from './car-card.utils'

import '@/assets/css/car-card.css'

interface CarCardProps {
  car: bookcarsTypes.Car
  days: number
  totalPrice: number
  language: string
  booking?: bookcarsTypes.Booking
  hidePrice?: boolean
  hideSupplier?: boolean
  pickupLocationName?: string
  distance?: string
  onBook?: () => void
  showBoostBadge?: boolean
}

const getExtraIcon = (
  option: 'cancellation' | 'deposit' | 'license' | 'amendments',
  extra: number,
  booking?: bookcarsTypes.Booking,
) => {
  let available = false

  if (booking) {
    if (option === 'cancellation' && booking.cancellation && extra > 0) {
      available = true
    }
    if (option === 'deposit') {
      available = true
    }
    if (option === 'license') {
      available = true
    }
    if (option === 'amendments' && booking.amendments && extra > 0) {
      available = true
    }
  }

  if (extra === -1) {
    return <UncheckIcon className="car-card__extra-icon car-card__extra-icon--unavailable" />
  }

  if (extra === 0 || available) {
    return <CheckIcon className="car-card__extra-icon car-card__extra-icon--available" />
  }

  return <InfoIcon className="car-card__extra-icon car-card__extra-icon--info" />
}

const CarCard = ({
  car,
  days,
  totalPrice,
  language,
  booking,
  hidePrice,
  hideSupplier,
  pickupLocationName,
  distance,
  onBook,
  showBoostBadge,
}: CarCardProps) => {
  const fr = language === 'fr'
  const availability = getAvailabilityDisplay(car.available, {
    available: strings.CAR_AVAILABLE,
    availableTooltip: strings.CAR_AVAILABLE_TOOLTIP,
    unavailable: strings.CAR_UNAVAILABLE,
    unavailableTooltip: strings.CAR_UNAVAILABLE_TOOLTIP,
  })
  const pricePerDay = days > 0 ? totalPrice / Math.max(days, 1) : totalPrice

  const productData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: car.name,
    image: bookcarsHelper.joinURL(env.CDN_CARS, car.image),
    offers: {
      '@type': 'Offer',
      price: car.dailyPrice,
      priceCurrency: 'TND',
      availability: 'https://schema.org/InStock',
    },
  }

  const handleBook = () => {
    if (onBook) {
      onBook()
    }
  }

  return (
    <article
      className={`car-card ${car.available ? 'car-card--available' : 'car-card--unavailable'}`}
      aria-live="polite"
    >
      <script type="application/ld+json">{JSON.stringify(productData)}</script>
      <div className="car-card__media">
        {showBoostBadge && car.boost && (
          <span className="car-card__boost" aria-label="Annonce sponsorisée">
            Boosté
          </span>
        )}

        {car.discounts && car.discounts.percentage && days >= car.discounts.threshold && (
          <span className="car-card__discount" aria-label={`Réduction de ${car.discounts.percentage}%`}>
            -
            {car.discounts.percentage}
            %
          </span>
        )}

        <img
          src={bookcarsHelper.joinURL(env.CDN_CARS, car.image)}
          alt={car.name}
          loading="lazy"
        />
      </div>

      <div className="car-card__content">
        <header className="car-card__header">
          <div className="car-card__title">
            <h2>{car.name}</h2>
            {!hideSupplier && (
              <a
                href={`/search/agence/${car.supplier.slug}`}
                className="car-card__agency"
                title={`Louer une voiture chez ${car.supplier.fullName}`}
                aria-label={`Louer une voiture chez ${car.supplier.fullName}`}
              >
                <Avatar
                  src={bookcarsHelper.joinURL(env.CDN_USERS, car.supplier.avatar)}
                  alt={car.supplier.fullName}
                  variant="rounded"
                  className="car-card__agency-avatar"
                />
                <span className="car-card__agency-name">
                  {car.supplier.agencyVerified && <VerifiedIcon className="car-card__verified" />}
                  {car.supplier.fullName}
                </span>
              </a>
            )}
          </div>
          {!hidePrice && (
            <div className="car-card__price">
              <span className="car-card__price-amount">
                {bookcarsHelper.formatPrice(pricePerDay, commonStrings.CURRENCY, language)}
              </span>
              <span className="car-card__price-caption">{strings.PRICE_PER_DAY}</span>
              <span className="car-card__price-total">
                {helper.getDays(days)}
                {' · '}
                {bookcarsHelper.formatPrice(totalPrice, commonStrings.CURRENCY, language)}
              </span>
            </div>
          )}
        </header>

        <div className="car-card__meta">
          <div className="car-card__rating">
            {car?.supplier?.score ? (
              <Tooltip
                title={
                  'Le score est basé sur la réactivité de l\'agence, le taux d\'acceptation des réservations selon leurs conditions et d\'autres critères.'
                }
                placement="top"
              >
                <span>
                  <Rating value={transformScore(car.supplier.score)} precision={0.1} readOnly size="small" />
                </span>
              </Tooltip>
            ) : (
              <span className="car-card__rating-placeholder">{strings.NO_RATING}</span>
            )}
            {car.trips > 0 && <span className="car-card__rating-count">{`(${car.trips} ${strings.TRIPS})`}</span>}
          </div>

          <Tooltip title={availability.tooltip} placement="top">
            <Chip
              label={availability.label}
              color={availability.color}
              variant={car.available ? 'filled' : 'outlined'}
              size="small"
              className="car-card__availability"
            />
          </Tooltip>
        </div>

        {(pickupLocationName || distance) && (
          <div className="car-card__location">
            <div className="car-card__location-main">
              <LocationIcon fontSize="small" />
              <span>{pickupLocationName}</span>
            </div>
            {distance && (
              <Chip
                label={`${distance} ${strings.FROM_YOU}`}
                variant="outlined"
                size="small"
              />
            )}
          </div>
        )}

        <div className="car-card__features" role="list">
          {car.type !== bookcarsTypes.CarType.Unknown && (
            <Tooltip title={helper.getCarTypeTooltip(car.type)} placement="top">
              <div className="car-card__feature" role="listitem">
                <BodyTypeIcon />
                <span>{helper.getCarTypeShort(car.type)}</span>
              </div>
            </Tooltip>
          )}

          <Tooltip title={helper.getGearboxTooltip(car.gearbox)} placement="top">
            <div className="car-card__feature" role="listitem">
              <GearboxIcon />
              <span>{helper.getGearboxTypeShort(car.gearbox)}</span>
            </div>
          </Tooltip>

          {car.seats > 0 && (
            <Tooltip title={helper.getSeatsTooltip(car.seats)} placement="top">
              <div className="car-card__feature" role="listitem">
                <SeatsIcon />
                <span>{car.seats}</span>
              </div>
            </Tooltip>
          )}

          {car.doors > 0 && (
            <Tooltip title={helper.getDoorsTooltip(car.doors)} placement="top">
              <div className="car-card__feature" role="listitem">
                <BodyTypeIcon />
                <span>{car.doors}</span>
              </div>
            </Tooltip>
          )}

          {car.aircon && (
            <Tooltip title={strings.AIRCON_TOOLTIP} placement="top">
              <div className="car-card__feature" role="listitem">
                <AirconIcon />
                <span>{strings.AIRCON_SHORT}</span>
              </div>
            </Tooltip>
          )}

          {car.mileage !== 0 && (
            <Tooltip title={helper.getMileageTooltip(car.mileage, language)} placement="top">
              <div className="car-card__feature" role="listitem">
                <MileageIcon />
                <span>{`${strings.MILEAGE}${fr ? ' : ' : ': '}${helper.getMileage(car.mileage, language)}`}</span>
              </div>
            </Tooltip>
          )}

          <Tooltip title={helper.getFuelPolicyTooltip(car.fuelPolicy)} placement="top">
            <div className="car-card__feature" role="listitem">
              <FuelPolicyIcon />
              <span>{`${strings.FUEL_POLICY}${fr ? ' : ' : ': '}${helper.getFuelPolicy(car.fuelPolicy)}`}</span>
            </div>
          </Tooltip>
        </div>

        <div className="car-card__extras" role="list">
          {car.deposit > -1 && (
            <Tooltip title={booking ? '' : helper.getDeposit(car.deposit, language)} placement="top">
              <div className="car-card__extra" role="listitem">
                {getExtraIcon('deposit', car.deposit, booking)}
                <span>{helper.getDeposit(car.deposit, language)}</span>
              </div>
            </Tooltip>
          )}

          {car.minimumDrivingLicenseYears !== undefined && car.minimumDrivingLicenseYears > 0 && (
            <Tooltip title={strings.DRIVER_LICENSE_TOOLTIP} placement="top">
              <div className="car-card__extra" role="listitem">
                {getExtraIcon('license', car.minimumDrivingLicenseYears, booking)}
                <span>{helper.getLicense(car.minimumDrivingLicenseYears, language)}</span>
              </div>
            </Tooltip>
          )}

          {car.cancellation > -1 && (
            <Tooltip title={helper.getCancellation(car.cancellation, language)} placement="top">
              <div className="car-card__extra" role="listitem">
                {getExtraIcon('cancellation', car.cancellation, booking)}
                <span>{helper.getCancellation(car.cancellation, language)}</span>
              </div>
            </Tooltip>
          )}

          {car.amendments > -1 && (
            <Tooltip title={helper.getAmendments(car.amendments, language)} placement="top">
              <div className="car-card__extra" role="listitem">
                {getExtraIcon('amendments', car.amendments, booking)}
                <span>{helper.getAmendments(car.amendments, language)}</span>
              </div>
            </Tooltip>
          )}
        </div>

        {!hidePrice && (
          <div className="car-card__actions">
            <Button
              variant="contained"
              color="primary"
              className="car-card__book"
              disabled={!!(car.minimumRentalDays && days < car.minimumRentalDays)}
              onClick={handleBook}
            >
              {car.minimumRentalDays && days < car.minimumRentalDays
                ? `${car.minimumRentalDays} jours minimum`
                : strings.BOOK}
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}

export const CarCardSkeleton = () => (
  <article className="car-card car-card--skeleton" aria-busy="true" aria-live="polite">
    <div className="car-card__media">
      <Skeleton variant="rounded" width="100%" height="100%" />
    </div>
    <div className="car-card__content">
      <div className="car-card__header">
        <div className="car-card__title">
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width={140} height={20} />
        </div>
        <div className="car-card__price">
          <Skeleton variant="text" width={100} height={32} />
          <Skeleton variant="text" width={80} height={16} />
        </div>
      </div>
      <div className="car-card__meta">
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="rounded" width={90} height={28} />
      </div>
      <div className="car-card__features">
        <Skeleton variant="rounded" width={110} height={32} />
        <Skeleton variant="rounded" width={90} height={32} />
        <Skeleton variant="rounded" width={80} height={32} />
      </div>
      <div className="car-card__extras">
        <Skeleton variant="rounded" width={150} height={28} />
        <Skeleton variant="rounded" width={130} height={28} />
      </div>
      <div className="car-card__actions">
        <Skeleton variant="rounded" width={160} height={44} />
      </div>
    </div>
  </article>
)

export default CarCard
