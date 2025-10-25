import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tooltip, Card, CardContent, Typography, Avatar, Rating } from '@mui/material'
import { LocalGasStation as CarTypeIcon, AccountTree as GearboxIcon, Person as SeatsIcon, AcUnit as AirconIcon, DirectionsCar as MileageIcon, Check as CheckIcon, Clear as UncheckIcon, Info as InfoIcon, LocationOn as LocationIcon, Verified as VerifiedIcon } from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import Const from '@/config/const'
import * as helper from '@/common/helper'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/cars'
import * as CarService from '@/services/CarService'
import * as UserService from '@/services/UserService'
import Pager from './Pager'
import Badge from './Badge'
import DoorsIcon from '@/assets/img/car-door.png'
import DistanceIcon from '@/assets/img/distance-icon.png'
import '@/assets/css/car-list.css'
import { getDefaultAnalyticsCurrency, sendCheckoutEvent } from '@/common/gtm'
import ProfileAlert from './ProfileAlert'

interface CarListProps {
  from?: Date;
  to?: Date;
  suppliers?: string[];
  pickupLocation?: string;
  dropOffLocation?: string;
  pickupLocationName?: string;
  carSpecs?: bookcarsTypes.CarSpecs;
  carType?: string[];
  gearbox?: string[];
  mileage?: string[];
  fuelPolicy?: string[];
  deposit?: number;
  cars?: bookcarsTypes.Car[];
  reload?: boolean;
  booking?: bookcarsTypes.Booking;
  className?: string;
  hidePrice?: boolean;
  hideSupplier?: boolean;
  loading?: boolean;
  sizeAuto?: boolean;
  ranges?: string[];
  multimedia?: string[];
  rating?: number;
  seats?: number;
  distance?: string;
  minPrice?: number;
  maxPrice?: number;
  boost?: boolean;
  onLoad?: bookcarsTypes.DataEvent<bookcarsTypes.Car>;
}

const CarList = ({
  from,
  to,
  suppliers,
  pickupLocation,
  dropOffLocation,
  pickupLocationName,
  carSpecs,
  carType: _carType,
  gearbox,
  mileage,
  fuelPolicy,
  deposit,
  cars,
  reload,
  booking,
  className,
  hidePrice,
  hideSupplier,
  loading: carListLoading,
  sizeAuto,
  ranges,
  multimedia,
  rating,
  seats,
  distance,
  minPrice: _minPrice,
  maxPrice: _maxPrice,
  boost = false, // Default value set to false if not provided
  onLoad,
}: CarListProps) => {
  const navigate = useNavigate()

  const [language, setLanguage] = useState(env.DEFAULT_LANGUAGE)
  const [init, setInit] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fetch, setFetch] = useState(false)
  const [rows, setRows] = useState<bookcarsTypes.Car[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const [page, setPage] = useState(1)
  const [days, setDays] = useState(0)

  useEffect(() => {
    setLanguage(UserService.getLanguage())
  }, [])

  useEffect(() => {
    if (from && to) {
      setDays(bookcarsHelper.days(from, to))
    }
  }, [from, to])

  useEffect(() => {
    if (env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || env.isMobile()) {
      const element = document.querySelector('body')

      if (element) {
        element.onscroll = () => {
          if (fetch
            && !loading
            && window.scrollY > 0
            && window.scrollY + window.innerHeight + env.INFINITE_SCROLL_OFFSET >= document.body.scrollHeight) {
            setLoading(true)
            setPage(page + 1)
          }
        }
      }
    }
  }, [fetch, loading, page])

  const fetchData = async (
    _page: number,
    _suppliers?: string[],
    _pickupLocation?: string,
    _carSpecs?: bookcarsTypes.CarSpecs,
    __carType?: string[],
    _gearbox?: string[],
    _mileage?: string[],
    _fuelPolicy?: string[],
    _deposit?: number,
    _ranges?: string[],
    _multimedia?: string[],
    _rating?: number,
    _seats?: number
  ) => {
    try {
      setLoading(true)
      const payload: bookcarsTypes.GetCarsPayload = {
        suppliers: _suppliers ?? [],
        pickupLocation: _pickupLocation,
        carSpecs: _carSpecs,
        carType: __carType,
        gearbox: _gearbox,
        mileage: _mileage,
        fuelPolicy: _fuelPolicy,
        deposit: _deposit,
        ranges: _ranges,
        multimedia: _multimedia,
        rating: _rating,
        seats: _seats,
        startDate: from,
        endDate: to,
        minPrice: _minPrice,
        maxPrice: _maxPrice
      }

      const data = boost ? await CarService.getBoostedCars(payload, _page, env.CARS_PAGE_SIZE) : await CarService.getCars(payload, _page, env.CARS_PAGE_SIZE)

      const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
      if (!_data) {
        helper.error()
        return
      }
      const _totalRecords = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

      let _rows = []
      if (env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || env.isMobile()) {
        _rows = _page === 1 ? _data.resultData : [...rows, ..._data.resultData]
      } else {
        _rows = _data.resultData
      }

      setRows(_rows)
      setRowCount((_page - 1) * env.CARS_PAGE_SIZE + _rows.length)
      setTotalRecords(_totalRecords)
      setFetch(_data.resultData.length > 0)

      if (((env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || env.isMobile()) && _page === 1) || (env.PAGINATION_MODE === Const.PAGINATION_MODE.CLASSIC && !env.isMobile())) {
        window.scrollTo(0, 0)
      }

      if (onLoad) {
        onLoad({ rows: _data.resultData, rowCount: _totalRecords })
      }
    } catch (err) {
      helper.error(err)
    } finally {
      setLoading(false)
      setInit(false)
    }
  }

  useEffect(() => {
    if (suppliers) {
      if (suppliers.length > 0) {
        fetchData(page, suppliers, pickupLocation, carSpecs, _carType, gearbox, mileage, fuelPolicy, deposit, ranges, multimedia, rating, seats)
      } else {
        setRows([])
        setFetch(false)
        if (onLoad) {
          onLoad({ rows: [], rowCount: 0 })
        }
        setInit(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, suppliers, pickupLocation, carSpecs, _carType, gearbox, mileage, fuelPolicy, deposit, ranges, multimedia, rating, seats, from, to])

  useEffect(() => {
    if (cars) {
      setRows(cars)
      setFetch(false)
      if (onLoad) {
        onLoad({ rows: cars, rowCount: cars.length })
      }
      setLoading(false)
    }
  }, [cars]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1)
  }, [suppliers, pickupLocation, carSpecs, _carType, gearbox, mileage, fuelPolicy, deposit, ranges, multimedia, rating, seats, from, to])

  useEffect(() => {
    if (reload) {
      setPage(1)
      fetchData(1, suppliers, pickupLocation, carSpecs, _carType, gearbox, mileage, fuelPolicy, deposit, ranges, multimedia, rating, seats)
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, suppliers, pickupLocation, carSpecs, _carType, gearbox, mileage, fuelPolicy, deposit, ranges, multimedia, rating, seats, _minPrice, _maxPrice])

  const getExtraIcon = (option: string, extra: number) => {
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
      if (option === 'collisionDamageWaiver' && booking.collisionDamageWaiver && extra > 0) {
        available = true
      }
      if (option === 'theftProtection' && booking.theftProtection && extra > 0) {
        available = true
      }
      if (option === 'fullInsurance' && booking.fullInsurance && extra > 0) {
        available = true
      }
      if (option === 'additionalDriver' && booking.additionalDriver && extra > 0) {
        available = true
      }
    }

    return extra === -1
      ? <UncheckIcon className="unavailable" />
      : extra === 0 || available
        ? <CheckIcon className="available" />
        : <InfoIcon className="extra-info" />
  }

  const fr = language === 'fr'
  /**
   * Transforme un score de 0 à 100 en un score de 0 à 5.
   * @param score Le score initial (entre 0 et 100).
   * @returns Le score transformé (entre 0 et 5).
   */
  const transformScore = (score: number | undefined): number => {
    // Vérifier que le score est bien entre 0 et 100
    if (!score || score < 0 || score > 100) {
      return 0
    }

    // Transformer le score de 0-100 à 0-5
    const transformedScore = (score / 100) * 5

    // Arrondir à une décimale pour plus de lisibilité
    return Math.round(transformedScore * 10) / 10
  }
  return (
    <>
      <section className={`${className ? `${className} ` : ''}car-list`}>
        <ProfileAlert />
        {rows.length === 0
          ? !init
          && !loading
          && !carListLoading
          && (
          <Card variant="outlined" className="empty-list">
            {!boost && (
            <CardContent>
              <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
            </CardContent>
            )}
          </Card>
          )
          : ((from && to && pickupLocation && dropOffLocation) || hidePrice) // || (hidePrice && booking))
          && (
            <>
              <div className="car-list-container">
                {totalRecords > 0 && !boost && (
                  <div className="bc-title">
                    <div className="bookcars">
                      <span>{strings.TITLE_1}</span>
                      <span className="title-bookcars">{commonStrings.BOOKCARS}</span>
                      <span>{strings.TITLE_2}</span>
                    </div>
                    <div className="car-count">
                      {`(${totalRecords} ${totalRecords === 1 ? strings.TITLE_CAR_AVAILABLE : strings.TITLE_CARS_AVAILABLE})`}
                    </div>
                  </div>
                )}

                <div className="car-list-wrapper">
                  {rows.map((car) => {
                    const totalPrice = bookcarsHelper.calculateTotalPrice(car, from as Date, to as Date)
                    const hasDays = days > 0
                    const hasTotalPrice = Number.isFinite(totalPrice)
                    const cardClassName = hidePrice ? 'car-card no-price' : 'car-card'
                    const unitPrice = hasDays && hasTotalPrice && days > 0 ? totalPrice / days : undefined
                    const pricePerDayText = unitPrice !== undefined && Number.isFinite(unitPrice)
                      ? `${bookcarsHelper.formatPrice(unitPrice, commonStrings.CURRENCY, language)}/${strings.PRICE_DAYS_PART_2}`
                      : undefined
                    const totalPriceText = hasDays && hasTotalPrice
                      ? `${helper.getDays(days)}${fr ? ' : ' : ': '}${bookcarsHelper.formatPrice(totalPrice, commonStrings.CURRENCY, language)}`
                      : undefined
                    const supplierClassName = sizeAuto ? 'supplier size-auto' : 'supplier'

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

                    return (
                      <div key={car._id} className="car-card-container">
                        <script type="application/ld+json">
                          {JSON.stringify(productData)}
                        </script>

                        {pickupLocationName && (
                          <div className="car-location-header">
                            <div className="location">
                              <LocationIcon />
                              <span className="location-name">{pickupLocationName}</span>
                            </div>
                            {distance && (
                              <div className="distance">
                                <img alt="Distance" src={DistanceIcon} />
                                <Badge backgroundColor="#D8EDF9" color="#000" text={`${distance} ${strings.FROM_YOU}`} />
                              </div>
                            )}
                          </div>
                        )}

                        <div className={cardClassName}>
                          <div className="car-media">
                            {boost && car.boost && (
                              <span className="badge-boosted">Boosté</span>
                            )}
                            {car
                              && car.discounts
                              && car.discounts.percentage
                              && days >= car.discounts.threshold && (
                                <Avatar className="discount-badge">
                                  -
                                  {car?.discounts?.percentage}
                                  {' '}
                                  <span className="discount-badge-percent">%</span>
                                </Avatar>
                            )}
                            <img
                              src={bookcarsHelper.joinURL(env.CDN_CARS, car.image)}
                              alt={car.name}
                              className="car-img"
                              loading="lazy"
                            />
                          </div>

                          <div className="car-main">
                            <div className="car-header">
                              <h2>{car.name}</h2>
                              {!hideSupplier && (
                                <a
                                  href={`/search/agence/${car.supplier.slug}`}
                                  className={supplierClassName}
                                  title={`Louler une voiture chez ${car.supplier.fullName} à partir de ${car.dailyPrice}DT/Jour`}
                                  aria-label={`Louler une voiture chez ${car.supplier.fullName} à partir de ${car.dailyPrice}DT/Jour`}
                                  itemScope
                                  itemType="https://schema.org/AutoRental"
                                >
                                  <span className="supplier-logo">
                                    <img
                                      loading="lazy"
                                      src={bookcarsHelper.joinURL(env.CDN_USERS, car.supplier.avatar)}
                                      alt={`Louler une voiture chez ${car.supplier.fullName} à partir de ${car.dailyPrice}DT/Jour`}
                                    />
                                  </span>
                                  <span className="supplier-name">
                                    {car.supplier.agencyVerified && (
                                      <VerifiedIcon className="agency-verified-badge" />
                                    )}
                                    {car.supplier.fullName}
                                  </span>
                                </a>
                              )}
                            </div>

                            <div className="car-rating">
                              {car?.supplier?.score && (
                                <Tooltip
                                  title={'Le score est basé sur la réactivité de l\'agence, le taux d\'acceptation des réservations selon leurs conditions et d\'autres critères.'}
                                  placement="top"
                                >
                                  <div className="rating-value">
                                    <Rating size="small" value={transformScore(car.supplier.score)} precision={0.1} readOnly />
                                  </div>
                                </Tooltip>
                              )}
                              {car.trips > 0 && <span className="rating-count">{`(${car.trips} ${strings.TRIPS})`}</span>}
                            </div>

                            <div className="car-specs">
                              {car.type !== bookcarsTypes.CarType.Unknown && (
                                <Tooltip title={helper.getCarTypeTooltip(car.type)} placement="top">
                                  <div className="spec-chip">
                                    <CarTypeIcon />
                                    <span>{helper.getCarTypeShort(car.type)}</span>
                                  </div>
                                </Tooltip>
                              )}
                              <Tooltip title={helper.getGearboxTooltip(car.gearbox)} placement="top">
                                <div className="spec-chip">
                                  <GearboxIcon />
                                  <span>{helper.getGearboxTypeShort(car.gearbox)}</span>
                                </div>
                              </Tooltip>
                              {car.seats > 0 && (
                                <Tooltip title={helper.getSeatsTooltip(car.seats)} placement="top">
                                  <div className="spec-chip">
                                    <SeatsIcon />
                                    <span>{car.seats}</span>
                                  </div>
                                </Tooltip>
                              )}
                              {car.doors > 0 && (
                                <Tooltip title={helper.getDoorsTooltip(car.doors)} placement="top">
                                  <div className="spec-chip">
                                    <img src={DoorsIcon} alt="" className="car-doors" />
                                    <span>{car.doors}</span>
                                  </div>
                                </Tooltip>
                              )}
                              {car.aircon && (
                                <Tooltip title={strings.AIRCON_TOOLTIP} placement="top">
                                  <div className="spec-chip">
                                    <AirconIcon />
                                    <span>AC</span>
                                  </div>
                                </Tooltip>
                              )}
                            </div>

                            <div className="car-lines">
                              {car.mileage !== 0 && (
                                <Tooltip title={helper.getMileageTooltip(car.mileage, language)} placement="left">
                                  <div className="line mileage">
                                    <span className="line-icon">
                                      <MileageIcon />
                                    </span>
                                    <span className="line-text">{`${strings.MILEAGE}${fr ? ' : ' : ': '}${helper.getMileage(car.mileage, language)}`}</span>
                                  </div>
                                </Tooltip>
                              )}
                              <Tooltip title={helper.getFuelPolicyTooltip(car.fuelPolicy)} placement="left">
                                <div className="line fuel-policy">
                                  <span className="line-icon">
                                    <CarTypeIcon />
                                  </span>
                                  <span className="line-text">{`${strings.FUEL_POLICY}${fr ? ' : ' : ': '}${helper.getFuelPolicy(car.fuelPolicy)}`}</span>
                                </div>
                              </Tooltip>
                              {car.deposit > -1 && (
                                <Tooltip
                                  title={booking ? '' : car.deposit > -1 ? strings.DEPOSIT_TOOLTIP : helper.getDeposit(car.cancellation, language)}
                                  placement="left"
                                >
                                  <div className="line deposit">
                                    <span className="line-icon">{getExtraIcon('deposit', car.deposit)}</span>
                                    <span className="line-text">{helper.getDeposit(car.deposit, language)}</span>
                                  </div>
                                </Tooltip>
                              )}
                              {car.minimumDrivingLicenseYears !== undefined && car.minimumDrivingLicenseYears > 0 && (
                                <Tooltip title={booking ? '' : strings.DRIVER_LICENSE_TOOLTIP} placement="left">
                                  <div className="line license">
                                    <span className="line-icon">{getExtraIcon('license', car.minimumDrivingLicenseYears)}</span>
                                    <span className="line-text">{helper.getLicense(car.minimumDrivingLicenseYears, language)}</span>
                                  </div>
                                </Tooltip>
                              )}
                              {car.cancellation > -1 && (
                                <Tooltip
                                  title={booking ? '' : car.cancellation > -1 ? strings.CANCELLATION_TOOLTIP : helper.getCancellation(car.cancellation, language)}
                                  placement="left"
                                >
                                  <div className="line cancellation">
                                    <span className="line-icon">{getExtraIcon('cancellation', car.cancellation)}</span>
                                    <span className="line-text">{helper.getCancellation(car.cancellation, language)}</span>
                                  </div>
                                </Tooltip>
                              )}
                              {car.amendments > -1 && (
                                <Tooltip
                                  title={booking ? '' : car.amendments > -1 ? strings.AMENDMENTS_TOOLTIP : helper.getAmendments(car.amendments, language)}
                                  placement="left"
                                >
                                  <div className="line amendments">
                                    <span className="line-icon">{getExtraIcon('amendments', car.amendments)}</span>
                                    <span className="line-text">{helper.getAmendments(car.amendments, language)}</span>
                                  </div>
                                </Tooltip>
                              )}
                            </div>
                          </div>

                          {!hidePrice && (
                            <div className="car-price">
                              {pricePerDayText && <div className="price-day">{pricePerDayText}</div>}
                              {totalPriceText && <div className="price-total">{totalPriceText}</div>}
                              <div className="car-actions">
                                <Button
                                  disabled={!!(car.minimumRentalDays && days < car.minimumRentalDays)}
                                  variant="contained"
                                  className="btn-book btn-margin-bottom"
                                  onClick={() => {
                                    if (car._id) {
                                      const rentalDays = Math.max(days, 1)
                                      const safeTotal = Number.isFinite(totalPrice) && totalPrice > 0 ? totalPrice : 0
                                      const pricePerUnit = rentalDays > 0 ? safeTotal / rentalDays : safeTotal

                                      sendCheckoutEvent({
                                        value: safeTotal,
                                        currency: getDefaultAnalyticsCurrency(),
                                        items: [
                                          {
                                            id: car._id,
                                            name: car.name,
                                            quantity: rentalDays,
                                            price: pricePerUnit,
                                            category: car.range,
                                          },
                                        ],
                                        contentType: car.range,
                                      })
                                    }
                                    navigate('/checkout', {
                                      state: {
                                        carId: car._id,
                                        pickupLocationId: pickupLocation,
                                        dropOffLocationId: dropOffLocation,
                                        from,
                                        to
                                      }
                                    })
                                  }}
                                >
                                  {car.minimumRentalDays && days < car.minimumRentalDays ? ` ${car.minimumRentalDays} jours minimum` : strings.BOOK}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
      </section>
      {env.PAGINATION_MODE === Const.PAGINATION_MODE.CLASSIC && !env.isMobile() && !boost && (
        <Pager page={page} pageSize={env.CARS_PAGE_SIZE} rowCount={rowCount} totalRecords={totalRecords} onNext={() => setPage(page + 1)} onPrevious={() => setPage(page - 1)} />
      )}
    </>
  )
}

export default CarList
