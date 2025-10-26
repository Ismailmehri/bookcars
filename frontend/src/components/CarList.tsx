import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button, Tooltip, Card, CardContent, Typography, Avatar, Rating
} from '@mui/material'
import {
  AccountTree as GearboxIcon,
  Person as SeatsIcon,
  AcUnit as AirconIcon,
  DirectionsCar as MileageIcon,
  Check as CheckIcon,
  Clear as UncheckIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import Const from '@/config/const'
import * as helper from '@/common/helper'
import { calculateDailyRate, normalizePrice } from '@/common/pricing'
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
import { buildSupplierLinkMessage, getSupplierProfilePath } from '@/common/supplier'

interface CarListProps {
  from?: Date
  to?: Date
  suppliers?: string[]
  pickupLocation?: string
  dropOffLocation?: string
  pickupLocationName?: string
  carSpecs?: bookcarsTypes.CarSpecs
  carType?: string[]
  gearbox?: string[]
  mileage?: string[]
  fuelPolicy?: string[]
  deposit?: number
  cars?: bookcarsTypes.Car[]
  reload?: boolean
  booking?: bookcarsTypes.Booking
  className?: string
  hidePrice?: boolean
  hideSupplier?: boolean
  loading?: boolean
  ranges?: string[]
  multimedia?: string[]
  rating?: number
  seats?: number
  distance?: string
  minPrice?: number
  maxPrice?: number
  boost?: boolean
  onLoad?: bookcarsTypes.DataEvent<bookcarsTypes.Car>
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
  ranges,
  multimedia,
  rating,
  seats,
  distance,
  minPrice: _minPrice,
  maxPrice: _maxPrice,
  boost = false,
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
 if (from && to) setDays(bookcarsHelper.days(from, to))
}, [from, to])

  useEffect(() => {
    if (env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || env.isMobile()) {
      const element = document.querySelector('body')
      if (element) {
        element.onscroll = () => {
          if (fetch && !loading && window.scrollY > 0
            && window.scrollY + window.innerHeight + env.INFINITE_SCROLL_OFFSET >= document.body.scrollHeight) {
            setLoading(true)
            setPage((p) => p + 1)
          }
        }
      }
    }
  }, [fetch, loading])

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
        maxPrice: _maxPrice,
      }

      const data = boost
        ? await CarService.getBoostedCars(payload, _page, env.CARS_PAGE_SIZE)
        : await CarService.getCars(payload, _page, env.CARS_PAGE_SIZE)

      const _data = data?.[0] ?? { pageInfo: { totalRecord: 0 }, resultData: [] }
      const _totalRecords = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

      const _rows = (env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || env.isMobile())
        ? (_page === 1 ? _data.resultData : [...rows, ..._data.resultData])
        : _data.resultData

      setRows(_rows)
      setRowCount((_page - 1) * env.CARS_PAGE_SIZE + _rows.length)
      setTotalRecords(_totalRecords)
      setFetch(_data.resultData.length > 0)

      if (((env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || env.isMobile()) && _page === 1)
        || (env.PAGINATION_MODE === Const.PAGINATION_MODE.CLASSIC && !env.isMobile())) {
        window.scrollTo(0, 0)
      }

      onLoad?.({ rows: _data.resultData, rowCount: _totalRecords })
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
        onLoad?.({ rows: [], rowCount: 0 })
        setInit(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, suppliers, pickupLocation, carSpecs, _carType, gearbox, mileage, fuelPolicy, deposit, ranges, multimedia, rating, seats, from, to])

  useEffect(() => {
    if (cars) {
      setRows(cars)
      setFetch(false)
      onLoad?.({ rows: cars, rowCount: cars.length })
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, suppliers, pickupLocation, carSpecs, _carType, gearbox, mileage, fuelPolicy, deposit, ranges, multimedia, rating, seats, _minPrice, _maxPrice])

  const getExtraIcon = (option: string, extra: number) => {
    let available = false
    if (booking) {
      if (option === 'cancellation' && booking.cancellation && extra > 0) available = true
      if (option === 'deposit') available = true
      if (option === 'license') available = true
      if (option === 'amendments' && booking.amendments && extra > 0) available = true
      if (option === 'collisionDamageWaiver' && booking.collisionDamageWaiver && extra > 0) available = true
      if (option === 'theftProtection' && booking.theftProtection && extra > 0) available = true
      if (option === 'fullInsurance' && booking.fullInsurance && extra > 0) available = true
      if (option === 'additionalDriver' && booking.additionalDriver && extra > 0) available = true
    }
    return extra === -1
      ? <UncheckIcon className="unavailable" />
      : extra === 0 || available
        ? <CheckIcon className="available" />
        : <InfoIcon className="extra-info" />
  }

  const fr = language === 'fr'
  const transformScore = (score?: number) => (!score || score < 0 || score > 100 ? 0 : Math.round(((score / 100) * 5) * 10) / 10)

  return (
    <>
      <section className={`${className ? `${className} ` : ''}car-list`}>
        <ProfileAlert />

        {rows.length === 0
          ? (!init && !loading && !carListLoading && (
          <Card variant="outlined" className="empty-list">
            {!boost && (
            <CardContent>
              <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
            </CardContent>
                )}
          </Card>
            ))
          : ((from && to && pickupLocation && dropOffLocation) || hidePrice) && (
          <>
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
                    const rentalDays = Math.max(days, 1)
                    const safeTotal = normalizePrice(totalPrice)
                    const dailyRate = calculateDailyRate(totalPrice, rentalDays)
                    const formattedDailyRate = bookcarsHelper.formatPrice(dailyRate, commonStrings.CURRENCY, language)
                    const priceSummary = `${helper.getDays(rentalDays)} : ${bookcarsHelper.formatPrice(safeTotal, commonStrings.CURRENCY, language)}`
                    const productData = {
                      '@context': 'https://schema.org',
                      '@type': 'Product',
                      name: car.name,
                      image: bookcarsHelper.joinURL(env.CDN_CARS, car.image),
                      offers: {
                        '@type': 'Offer',
                        price: car.dailyPrice ?? 0,
                        priceCurrency: 'TND',
                        availability: 'https://schema.org/InStock',
                      },
                    }
                    const supplierProfilePath = getSupplierProfilePath(car.supplier.slug ?? '')
                    const hasDailyPrice = typeof car.dailyPrice === 'number' && Number.isFinite(car.dailyPrice)
                    const supplierDailyPriceLabel = hasDailyPrice
                      ? bookcarsHelper.formatPrice(
                        normalizePrice(car.dailyPrice ?? 0),
                        commonStrings.CURRENCY,
                        language,
                      )
                      : undefined
                    const supplierLinkDescription = buildSupplierLinkMessage({
                      supplierName: car.supplier.fullName,
                      dailyPriceLabel: supplierDailyPriceLabel,
                      dailySuffix: commonStrings.DAILY,
                    })

                    return (
                      <div key={car._id} className="car-list-container">
                        <script type="application/ld+json">{JSON.stringify(productData)}</script>

                        {pickupLocationName && (
                          <div className="car-header">
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

                        {/* === CAR CARD – COMPACT SAAS === */}
                        <article className="car-card">
                          {boost && car.boost && (
                            <span className="badge-boosted">Boosté</span>
                          )}

                          {/* MEDIA */}
                          <div className="car-media">
                            {car?.discounts?.percentage && days >= (car.discounts?.threshold ?? 0) && (
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
                              loading="lazy"
                            />
                          </div>

                          {/* MAIN */}
                          <div className="car-main">
                            {/* Title + supplier */}
                            <div className="car-title-row">
                              <h2 className="car-title" title={car.name}>{car.name}</h2>
                              {!hideSupplier && (
                                <a
                                  href={supplierProfilePath}
                                  className="supplier supplier-link"
                                  title={supplierLinkDescription}
                                  aria-label={supplierLinkDescription}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  itemScope
                                  itemType="https://schema.org/AutoRental"
                                >
                                  <Avatar
                                    src={bookcarsHelper.joinURL(env.CDN_USERS, car.supplier.avatar)}
                                    alt={car.supplier.fullName}
                                    className="supplier-avatar"
                                    imgProps={{ style: { objectFit: 'contain' } }}
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

                            {/* Rating */}
                            <div className="rating-row">
                              {car?.supplier?.score && (
                                <Tooltip
                                  title={'Le score est basé sur la réactivité de l\'agence, le taux d\'acceptation et d’autres critères.'}
                                  placement="top"
                                >
                                  <span className="rating-stars">
                                    <Rating size="small" value={transformScore(car.supplier.score)} precision={0.1} readOnly />
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

                            {/* SPECS – une seule ligne compacte */}
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
                                    <img src={DoorsIcon} className="chip-door" alt={helper.getDoorsTooltip(car.doors)} />
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

                            {/* INFO LINES – uniquement 3 lignes */}
                            <ul className="info-lines">
                              {car.mileage !== 0 && (
                                <li className="line">
                                  <MileageIcon fontSize="small" />
                                  <span>{`${strings.MILEAGE}${fr ? ' : ' : ': '}${helper.getMileage(car.mileage, language)}`}</span>
                                </li>
                              )}
                              {car.deposit > -1 && (
                                <li className="line">
                                  {getExtraIcon('deposit', car.deposit)}
                                  <span>{helper.getDeposit(car.deposit, language)}</span>
                                </li>
                              )}
                              {car.minimumDrivingLicenseYears !== undefined && car.minimumDrivingLicenseYears > 0 && (
                                <li className="line">
                                  {getExtraIcon('license', car.minimumDrivingLicenseYears)}
                                  <span>{helper.getLicense(car.minimumDrivingLicenseYears, language)}</span>
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* PRICE */}
                          {!hidePrice && (
                            <div className="car-price">
                              <div className="price-top">
                                <span className="price-day">
                                  {formattedDailyRate}
                                  <span className="price-unit">
                                    /
                                    {strings.PRICE_DAYS_PART_2}
                                  </span>
                                </span>
                                <span className="price-total">{priceSummary}</span>
                              </div>

                              <Button
                                disabled={!!(car.minimumRentalDays && days < car.minimumRentalDays)}
                                variant="contained"
                                className="btn-book"
                                onClick={() => {
                                  if (car._id) {
                                    sendCheckoutEvent({
                                      value: safeTotal,
                                      currency: getDefaultAnalyticsCurrency(),
                                      items: [{ id: car._id, name: car.name, quantity: rentalDays, price: dailyRate, category: car.range }],
                                      contentType: car.range,
                                    })
                                  }
                                  navigate('/checkout', {
                                    state: { carId: car._id, pickupLocationId: pickupLocation, dropOffLocationId: dropOffLocation, from, to }
                                  })
                                }}
                              >
                                {car.minimumRentalDays && days < car.minimumRentalDays
                                  ? ` ${car.minimumRentalDays} ${strings.DAYS_MINIMUM || 'jours minimum'}`
                                  : strings.BOOK}
                              </Button>
                            </div>
                          )}
                        </article>
                      </div>
                    )
                  })}
            </div>
          </>
            )}
      </section>

      {env.PAGINATION_MODE === Const.PAGINATION_MODE.CLASSIC && !env.isMobile() && !boost && (
        <Pager
          page={page}
          pageSize={env.CARS_PAGE_SIZE}
          rowCount={rowCount}
          totalRecords={totalRecords}
          onNext={() => setPage(page + 1)}
          onPrevious={() => setPage(page - 1)}
        />
      )}
    </>
  )
}

export default CarList
