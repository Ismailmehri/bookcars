import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tooltip, Card, CardContent, Typography, Avatar, Rating } from '@mui/material'
import { LocalGasStation as CarTypeIcon, AccountTree as GearboxIcon, Person as SeatsIcon, AcUnit as AirconIcon, DirectionsCar as MileageIcon, Check as CheckIcon, Clear as UncheckIcon, Info as InfoIcon, LocationOn as LocationIcon } from '@mui/icons-material'
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
import { sendCheckoutEvent } from '@/common/gtm'
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
              <div>
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

                {rows.map((car) => {
                const totalPrice = bookcarsHelper.calculateTotalPrice(car, from as Date, to as Date)

  // Données pour le JSON-LD
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
    <div key={car._id} className="car-list-container">
      {/* JSON-LD pour chaque voiture */}
      <script type="application/ld+json">
        {JSON.stringify(productData)}
      </script>

      {/* Contenu de la carte de voiture */}
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

      <article>
        {boost && car.boost && (
          <div className="sponsored-badge">
            <span>Ce véhicule est sponsorisé</span>
          </div>
        )}
        <div className="name">
          <h2>{car.name}</h2>
        </div>
        <div className="car">
          {car && car.discounts && car.discounts.percentage && days >= car.discounts.threshold && ( // Conditionally render the discount badge
            <Avatar sx={{ top: env.isMobile() ? '-45%' : '0px', left: env.isMobile() ? '78%' : '0px', fontSize: '1.2rem', color: '#FFF', background: '#ef8b04', width: '50px', height: '50px', float: 'inline-end' }}>
              -
              {car?.discounts?.percentage}
              {' '}
              <span style={{ fontSize: '0.5rem', position: 'relative', top: '-7px' }}>%</span>
            </Avatar>
          )}
          <img src={bookcarsHelper.joinURL(env.CDN_CARS, car.image)} alt={car.name} className="car-img" loading="lazy" />
          <div className="car-footer" style={hidePrice ? { bottom: 10 } : undefined}>
            {!hideSupplier && (
              <a
                href={`/search?pickupLocation=${pickupLocation}&supplier=${car.supplier._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
                title={`Louler une voiture chez ${car.supplier.fullName} à partir de ${car.dailyPrice}DT/Jour`}
                aria-label={`Louler une voiture chez ${car.supplier.fullName} à partir de ${car.dailyPrice}DT/Jour`}
                itemScope
                itemType="https://schema.org/AutoRental"
              >
                <div className="car-supplier" style={sizeAuto ? { bottom: 10 } : {}} title={car.supplier.fullName}>
                  <span className="car-supplier-logo">
                    <img
                      loading="lazy"
                      src={bookcarsHelper.joinURL(env.CDN_USERS, car.supplier.avatar)}
                      alt={`Louler une voiture chez ${car.supplier.fullName} à partir de ${car.dailyPrice}DT/Jour`}
                    />
                  </span>
                  <span className="car-supplier-info">{car.supplier.fullName}</span>
                </div>
              </a>
            )}
            <div className="car-footer-info">
              <div className="rating">
                {car?.supplier?.score && (
                  <>
                    <Tooltip title={'Le score est basé sur la réactivité de l\'agence, le taux d\'acceptation des réservations selon leurs conditions et d\'autres critères.'} placement="top">
                      <Typography variant="h6" className="user-info">
                        <Rating size="small" value={transformScore(car.supplier.score)} precision={0.1} readOnly />
                      </Typography>
                    </Tooltip>
                  </>
                )}
                {car.trips >= 10 && <span className="trips">{`(${car.trips} ${strings.TRIPS})`}</span>}
              </div>
              { /* car.co2 && (
                <div className="co2">
                  <img
                    alt="CO2 Effect"
                    src={
                      car.co2 <= 90
                        ? CO2MinIcon
                        : car.co2 <= 110
                          ? CO2MiddleIcon
                          : CO2MaxIcon
                    }
                  />
                  <span>{strings.CO2}</span>
                </div>
              ) */ }
            </div>
          </div>
        </div>

        <div className="car-info" style={hidePrice && !env.isMobile() ? { width: '57%' } : {}}>
          <ul className="car-info-list">
            {car.type !== bookcarsTypes.CarType.Unknown && (
              <li className="car-type">
                <Tooltip title={helper.getCarTypeTooltip(car.type)} placement="top">
                  <div className="car-info-list-item">
                    <CarTypeIcon />
                    <span className="car-info-list-text">{helper.getCarTypeShort(car.type)}</span>
                  </div>
                </Tooltip>
              </li>
            )}
            <li className="gearbox">
              <Tooltip title={helper.getGearboxTooltip(car.gearbox)} placement="top">
                <div className="car-info-list-item">
                  <GearboxIcon />
                  <span className="car-info-list-text">{helper.getGearboxTypeShort(car.gearbox)}</span>
                </div>
              </Tooltip>
            </li>
            {car.seats > 0 && (
              <li className="seats">
                <Tooltip title={helper.getSeatsTooltip(car.seats)} placement="top">
                  <div className="car-info-list-item">
                    <SeatsIcon />
                    <span className="car-info-list-text">{car.seats}</span>
                  </div>
                </Tooltip>
              </li>
            )}
            {car.doors > 0 && (
              <li className="doors">
                <Tooltip title={helper.getDoorsTooltip(car.doors)} placement="top">
                  <div className="car-info-list-item">
                    <img src={DoorsIcon} alt="" className="car-doors" />
                    <span className="car-info-list-text">{car.doors}</span>
                  </div>
                </Tooltip>
              </li>
            )}
            {car.aircon && (
              <li className="aircon">
                <Tooltip title={strings.AIRCON_TOOLTIP} placement="top">
                  <div className="car-info-list-item">
                    <AirconIcon />
                  </div>
                </Tooltip>
              </li>
            )}
            {car.mileage !== 0 && (
              <li className="mileage">
                <Tooltip title={helper.getMileageTooltip(car.mileage, language)} placement="left">
                  <div className="car-info-list-item">
                    <MileageIcon />
                    <span className="car-info-list-text">{`${strings.MILEAGE}${fr ? ' : ' : ': '}${helper.getMileage(car.mileage, language)}`}</span>
                  </div>
                </Tooltip>
              </li>
            )}
            <li className="fuel-policy">
              <Tooltip title={helper.getFuelPolicyTooltip(car.fuelPolicy)} placement="left">
                <div className="car-info-list-item">
                  <CarTypeIcon />
                  <span className="car-info-list-text">{`${strings.FUEL_POLICY}${fr ? ' : ' : ': '}${helper.getFuelPolicy(car.fuelPolicy)}`}</span>
                </div>
              </Tooltip>
            </li>
          </ul>

          <ul className="extras-list">
            {car.deposit > -1 && (
              <li>
                <Tooltip title={booking ? '' : car.deposit > -1 ? strings.DEPOSIT_TOOLTIP : helper.getDeposit(car.cancellation, language)} placement="left">
                  <div className="car-info-list-item">
                    {getExtraIcon('deposit', car.deposit)}
                    <span className="car-info-list-text">{helper.getDeposit(car.deposit, language)}</span>
                  </div>
                </Tooltip>
              </li>
            )}
            {car.minimumDrivingLicenseYears !== undefined && car.minimumDrivingLicenseYears > 0 && (
              <li>
                <Tooltip title={booking ? '' : strings.DRIVER_LICENSE_TOOLTIP} placement="left">
                  <div className="car-info-list-item">
                    {getExtraIcon('license', car.minimumDrivingLicenseYears)}
                    <span className="car-info-list-text">{helper.getLicense(car.minimumDrivingLicenseYears, language)}</span>
                  </div>
                </Tooltip>
              </li>
            )}
            {car.cancellation > -1 && (
              <li>
                <Tooltip title={booking ? '' : car.cancellation > -1 ? strings.CANCELLATION_TOOLTIP : helper.getCancellation(car.cancellation, language)} placement="left">
                  <div className="car-info-list-item">
                    {getExtraIcon('cancellation', car.cancellation)}
                    <span className="car-info-list-text">{helper.getCancellation(car.cancellation, language)}</span>
                  </div>
                </Tooltip>
              </li>
            )}
            {car.amendments > -1 && (
              <li>
                <Tooltip title={booking ? '' : car.amendments > -1 ? strings.AMENDMENTS_TOOLTIP : helper.getAmendments(car.amendments, language)} placement="left">
                  <div className="car-info-list-item">
                    {getExtraIcon('amendments', car.amendments)}
                    <span className="car-info-list-text">{helper.getAmendments(car.amendments, language)}</span>
                  </div>
                </Tooltip>
              </li>
            )}
          </ul>
        </div>

        {!hidePrice && (
          <div className="price">
            <span className="price-days">{helper.getDays(days)}</span>
            <span className="price-main">{bookcarsHelper.formatPrice(totalPrice, commonStrings.CURRENCY, language)}</span>
            <span className="price-day">{`${strings.PRICE_PER_DAY} ${bookcarsHelper.formatPrice(totalPrice / days, commonStrings.CURRENCY, language)}`}</span>
          </div>
        )}

        {!hidePrice && (
          <div className="action">
            <Button
              disabled={!!(car.minimumRentalDays && days < car.minimumRentalDays)}
              variant="contained"
              className="btn-book btn-margin-bottom"
              onClick={() => {
                sendCheckoutEvent(totalPrice, [{ id: car.id, name: car.name, quantity: days, price: totalPrice / days }])
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
        <Pager page={page} pageSize={env.CARS_PAGE_SIZE} rowCount={rowCount} totalRecords={totalRecords} onNext={() => setPage(page + 1)} onPrevious={() => setPage(page - 1)} />
      )}
    </>
  )
}

export default CarList
