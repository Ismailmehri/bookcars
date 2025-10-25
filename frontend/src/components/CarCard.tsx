import React, { useMemo, useState } from 'react'
import {
  Avatar,
  Button,
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
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
  MeetingRoom as DoorsIcon,
  AccountBalanceWallet as DepositIcon,
  AssignmentInd as LicenseIcon,
} from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import * as helper from '@/common/helper'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/cars'
import carPlaceholder from '@/assets/img/car-placeholder.svg'
import { transformScore, getSupplierInitials } from './car-card.utils'

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
  const rentalDays = Math.max(days || 0, 1)
  const pricePerDay = days > 0 ? totalPrice / rentalDays : totalPrice
  const [imageSrc, setImageSrc] = useState(
    car.image ? bookcarsHelper.joinURL(env.CDN_CARS, car.image) : carPlaceholder,
  )

  const supplierAvatar = car.supplier.avatar
    ? bookcarsHelper.joinURL(env.CDN_USERS, car.supplier.avatar)
    : undefined
  const supplierInitials = useMemo(() => getSupplierInitials(car.supplier.fullName), [car.supplier.fullName])

  const featureItems = useMemo(() => {
    const items: {
      icon: React.ReactNode
      label: string
      tooltip?: string
    }[] = []

    if (car.type !== bookcarsTypes.CarType.Unknown) {
      items.push({
        icon: <BodyTypeIcon fontSize="small" />,
        label: helper.getCarTypeShort(car.type),
        tooltip: helper.getCarTypeTooltip(car.type),
      })
    }

    items.push({
      icon: <GearboxIcon fontSize="small" />,
      label: helper.getGearboxTypeShort(car.gearbox),
      tooltip: helper.getGearboxTooltip(car.gearbox),
    })

    if (car.seats > 0) {
      items.push({
        icon: <SeatsIcon fontSize="small" />,
        label: `${car.seats}`,
        tooltip: helper.getSeatsTooltip(car.seats),
      })
    }

    if (car.doors > 0) {
      items.push({
        icon: <DoorsIcon fontSize="small" />,
        label: `${car.doors}`,
        tooltip: helper.getDoorsTooltip(car.doors),
      })
    }

    if (car.aircon) {
      items.push({
        icon: <AirconIcon fontSize="small" />,
        label: strings.AIRCON_SHORT,
        tooltip: strings.AIRCON_TOOLTIP,
      })
    }

    return items
  }, [car.aircon, car.doors, car.gearbox, car.seats, car.type])

  const policyItems = useMemo(() => {
    const items: {
      icon: React.ReactNode
      label: string
      tooltip?: string
    }[] = []

    if (car.mileage !== 0) {
      items.push({
        icon: <MileageIcon fontSize="small" />,
        label: `${strings.MILEAGE}${fr ? ' · ' : ': '}${helper.getMileage(car.mileage, language)}`,
        tooltip: helper.getMileageTooltip(car.mileage, language),
      })
    }

    items.push({
      icon: <FuelPolicyIcon fontSize="small" />,
      label: `${strings.FUEL_POLICY}${fr ? ' · ' : ': '}${helper.getFuelPolicy(car.fuelPolicy)}`,
      tooltip: helper.getFuelPolicyTooltip(car.fuelPolicy),
    })

    if (car.deposit > -1) {
      items.push({
        icon: <DepositIcon fontSize="small" />,
        label: `${strings.DEPOSIT}${fr ? ' · ' : ': '}${helper.getDeposit(car.deposit, language)}`,
        tooltip: booking ? undefined : strings.DEPOSIT_TOOLTIP,
      })
    }

    if (car.minimumDrivingLicenseYears !== undefined && car.minimumDrivingLicenseYears > 0) {
      items.push({
        icon: <LicenseIcon fontSize="small" />,
        label: `${strings.DRIVER_LICENSE}${fr ? ' · ' : ': '}${helper.getLicense(car.minimumDrivingLicenseYears, language)}`,
        tooltip: strings.DRIVER_LICENSE_TOOLTIP,
      })
    }

    return items
  }, [booking, car.deposit, car.fuelPolicy, car.mileage, car.minimumDrivingLicenseYears, fr, language])

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
    <article className="car-card" aria-live="polite">
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
          src={imageSrc}
          alt={car.name}
          loading="lazy"
          onError={() => {
            setImageSrc(carPlaceholder)
          }}
        />
      </div>

      <div className="car-card__body">
        <header className="car-card__header">
          <div className="car-card__identity">
            <h2 className="car-card__title">{car.name}</h2>
            {!hideSupplier && (
              <a
                href={`/search/agence/${car.supplier.slug}`}
                className="car-card__agency"
                title={`Louer une voiture chez ${car.supplier.fullName}`}
                aria-label={`Louer une voiture chez ${car.supplier.fullName}`}
              >
                <Avatar
                  src={supplierAvatar}
                  alt={car.supplier.fullName}
                  variant="rounded"
                  className="car-card__agency-avatar"
                  sx={{
                    bgcolor: '#e2e8f0',
                    color: '#0b6bd3',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  {supplierInitials}
                </Avatar>
                <span className="car-card__agency-name">
                  {car.supplier.agencyVerified && <VerifiedIcon className="car-card__verified" />}
                  {car.supplier.fullName}
                </span>
              </a>
            )}
          </div>

          {!hidePrice && (
            <div className="car-card__pricing">
              <span className="car-card__price-amount">
                {bookcarsHelper.formatPrice(pricePerDay, commonStrings.CURRENCY, language)}
              </span>
              <span className="car-card__price-label">{strings.PRICE_PER_DAY}</span>
              <span className="car-card__price-total">
                {`${helper.getDays(rentalDays)} : ${bookcarsHelper.formatPrice(totalPrice, commonStrings.CURRENCY, language)}`}
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
            {showBoostBadge && car.boost && (
              <span className="car-card__boost-pill">Boosté</span>
            )}
          </div>

          {(pickupLocationName || distance) && (
            <div className="car-card__location">
              {pickupLocationName && (
                <span className="car-card__location-main">
                  <LocationIcon fontSize="small" />
                  {pickupLocationName}
                </span>
              )}
              {distance && <span className="car-card__location-distance">{`${distance} ${strings.FROM_YOU}`}</span>}
            </div>
          )}
        </div>

        <div className="car-card__specs" role="list">
          {featureItems.map((item) => (
            <Tooltip key={`${item.label}`} title={item.tooltip || ''} placement="top">
              <div className="car-card__spec" role="listitem">
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Tooltip>
          ))}
        </div>

        <div className="car-card__policies" role="list">
          {policyItems.map((item) => (
            <Tooltip key={item.label} title={item.tooltip || ''} placement="top">
              <div className="car-card__policy" role="listitem">
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Tooltip>
          ))}
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
    <div className="car-card__body">
      <div className="car-card__header">
        <div className="car-card__identity">
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width={140} height={20} />
        </div>
        <div className="car-card__pricing">
          <Skeleton variant="text" width={100} height={28} />
          <Skeleton variant="text" width={90} height={16} />
        </div>
      </div>
      <div className="car-card__meta">
        <Skeleton variant="text" width={160} height={20} />
      </div>
      <div className="car-card__specs">
        <Skeleton variant="rounded" width={110} height={28} />
        <Skeleton variant="rounded" width={90} height={28} />
        <Skeleton variant="rounded" width={80} height={28} />
      </div>
      <div className="car-card__policies">
        <Skeleton variant="rounded" width={150} height={24} />
        <Skeleton variant="rounded" width={130} height={24} />
      </div>
      <div className="car-card__actions">
        <Skeleton variant="rounded" width={160} height={44} />
      </div>
    </div>
  </article>
)

export default CarCard
