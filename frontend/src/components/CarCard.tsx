import React from 'react'
import { Avatar, Button, Rating, Tooltip } from '@mui/material'
import {
  AccountTree as GearboxIcon,
  Person as SeatsIcon,
  AcUnit as AirconIcon,
  DirectionsCar as MileageIcon,
  Check as CheckIcon,
  Clear as UncheckIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import { strings } from '@/lang/cars'
import * as helper from '@/common/helper'
import DoorsIcon from '@/assets/img/car-door.png'
import DistanceIcon from '@/assets/img/distance-icon.png'
import { type CarCardViewModel } from './car-list.view-model'
import Badge from './Badge'

interface CarCardProps {
  car: bookcarsTypes.Car
  booking?: bookcarsTypes.Booking
  viewModel: CarCardViewModel
  pickupLocationName?: string
  distance?: string
  hidePrice?: boolean
  hideSupplier?: boolean
  boost?: boolean
  language: string
  onBook: () => void
}

const renderExtraIcon = (option: string, extra: number, booking?: bookcarsTypes.Booking) => {
  const available = booking
    ? ((option === 'cancellation' && booking.cancellation && extra > 0)
      || option === 'deposit'
      || option === 'license'
      || (option === 'amendments' && booking.amendments && extra > 0)
      || (option === 'collisionDamageWaiver' && booking.collisionDamageWaiver && extra > 0)
      || (option === 'theftProtection' && booking.theftProtection && extra > 0)
      || (option === 'fullInsurance' && booking.fullInsurance && extra > 0)
      || (option === 'additionalDriver' && booking.additionalDriver && extra > 0))
    : false

  if (extra === -1) {
    return <UncheckIcon className="unavailable" />
  }

  if (extra === 0 || available) {
    return <CheckIcon className="available" />
  }

  return <InfoIcon className="extra-info" />
}

const CarCard = ({
  car,
  booking,
  viewModel,
  pickupLocationName,
  distance,
  hidePrice,
  hideSupplier,
  boost,
  language,
  onBook,
}: CarCardProps) => {
  const fr = language === 'fr'
  const cardId = `car-${car._id ?? car.name}`
  const scoreValue = Math.max(0, Math.round(((car.supplier.score || 0) / 100) * 5 * 10) / 10)

  return (
    <article className="car-card" id={cardId}>
      <script type="application/ld+json">{JSON.stringify(viewModel.productData)}</script>

      {(pickupLocationName || distance) && (
        <div className="car-header">
          {pickupLocationName && (
            <div className="location">
              <LocationIcon />
              <span className="location-name">{pickupLocationName}</span>
            </div>
          )}
          {distance && (
            <div className="distance">
              <img alt="Distance" src={DistanceIcon} width={16} height={16} loading="lazy" />
              <Badge backgroundColor="#D8EDF9" color="#000" text={`${distance} ${strings.FROM_YOU}`} />
            </div>
          )}
        </div>
      )}

      {boost && car.boost && (
        <span className="badge-boosted">Boosté</span>
      )}

      <div className="car-media">
        {viewModel.showDiscountBadge && car?.discounts?.percentage && (
          <Avatar
            sx={{ position: 'absolute', top: 10, right: 10, fontSize: '1.1rem', color: '#fff', background: '#ef8b04', width: 42, height: 42 }}
          >
            -
            {car.discounts.percentage}
            <span style={{ fontSize: '0.55rem', marginLeft: 2 }}>%</span>
          </Avatar>
        )}
        <img
          src={bookcarsHelper.joinURL(env.CDN_CARS, car.image)}
          alt={car.name}
          className="car-img"
          width={env.CAR_IMAGE_WIDTH}
          height={env.CAR_IMAGE_HEIGHT}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="car-main">
        <div className="car-title-row">
          <h2 className="car-title" title={car.name}>{car.name}</h2>
          {!hideSupplier && (
            <a
              href={viewModel.supplierProfilePath}
              className="supplier supplier-link"
              title={viewModel.supplierLinkDescription}
              aria-label={viewModel.supplierLinkDescription}
              target="_blank"
              rel="noopener noreferrer"
              itemScope
              itemType="https://schema.org/Thing"
            >
              <Avatar
                src={bookcarsHelper.joinURL(env.CDN_USERS, car.supplier.avatar)}
                alt={car.supplier.fullName}
                className="supplier-avatar"
                imgProps={{ style: { objectFit: 'contain' }, loading: 'lazy', decoding: 'async' }}
              />
              <span className="supplier-name" title={car.supplier.fullName}>
                {car.supplier.agencyVerified && (
                  <VerifiedIcon className="agency-verified-badge" aria-hidden="true" />
                )}
                {car.supplier.fullName}
              </span>
            </a>
          )}
        </div>

        <div className="rating-row">
          {car?.supplier?.score && (
            <Tooltip
              title={'Le score est basé sur la réactivité de l\'agence, le taux d\'acceptation et d’autres critères.'}
              placement="top"
            >
              <span className="rating-stars">
                <Rating size="small" value={scoreValue} precision={0.1} readOnly />
              </span>
            </Tooltip>
          )}
          {car.trips > 0 && (
            <span className="trips">
              (
              {car.trips}
              {' '}
              {strings.TRIPS}
              )
            </span>
          )}
        </div>

        <ul className="specs-row">
          <li>
            <Tooltip title={helper.getGearboxTooltip(car.gearbox)}>
              <span className="chip">
                <GearboxIcon fontSize="small" />
                <b>{helper.getGearboxTypeShort(car.gearbox)}</b>
              </span>
            </Tooltip>
          </li>
          {!!car.seats && (
            <li>
              <Tooltip title={helper.getSeatsTooltip(car.seats)}>
                <span className="chip">
                  <SeatsIcon fontSize="small" />
                  {car.seats}
                </span>
              </Tooltip>
            </li>
          )}
          {!!car.doors && (
            <li>
              <Tooltip title={helper.getDoorsTooltip(car.doors)}>
                <span className="chip">
                  <img src={DoorsIcon} className="chip-door" alt={helper.getDoorsTooltip(car.doors)} width={18} height={18} loading="lazy" />
                  {car.doors}
                </span>
              </Tooltip>
            </li>
          )}
          {car.aircon && (
            <li>
              <Tooltip title={strings.AIRCON_TOOLTIP}>
                <span className="chip">
                  <AirconIcon fontSize="small" />
                  AC
                </span>
              </Tooltip>
            </li>
          )}
        </ul>

        <ul className="info-lines">
          {car.mileage !== 0 && (
            <li className="line">
              <MileageIcon fontSize="small" />
              <span>{`${strings.MILEAGE}${fr ? ' : ' : ': '}${helper.getMileage(car.mileage, language)}`}</span>
            </li>
          )}
          {car.deposit > -1 && (
            <li className="line">
              {renderExtraIcon('deposit', car.deposit, booking)}
              <span>{helper.getDeposit(car.deposit, language)}</span>
            </li>
          )}
          {car.minimumDrivingLicenseYears !== undefined && car.minimumDrivingLicenseYears > 0 && (
            <li className="line">
              {renderExtraIcon('license', car.minimumDrivingLicenseYears, booking)}
              <span>{helper.getLicense(car.minimumDrivingLicenseYears, language)}</span>
            </li>
          )}
        </ul>
      </div>

      {!hidePrice && (
        <div className="car-price">
          <div className="price-top">
            <span className="price-day">
              {viewModel.formattedDailyRate}
              <span className="price-unit">
                /
                {strings.PRICE_DAYS_PART_2}
              </span>
            </span>
            <span className="price-total">{viewModel.priceSummary}</span>
          </div>

          <Button
            disabled={viewModel.disableBooking}
            variant="contained"
            className="btn-book"
            onClick={onBook}
          >
            {car.minimumRentalDays && viewModel.rentalDays < car.minimumRentalDays
              ? ` ${car.minimumRentalDays} ${strings.DAYS_MINIMUM || 'jours minimum'}`
              : strings.BOOK}
          </Button>
        </div>
      )}
    </article>
  )
}

export default React.memo(CarCard)
