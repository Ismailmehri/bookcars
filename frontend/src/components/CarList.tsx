import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Typography } from '@mui/material'
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
import CarCard, { CarCardSkeleton } from './CarCard'
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
  const [error, setError] = useState<string | null>(null)
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
      setError(null)
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
      setError(commonStrings.GENERIC_ERROR_MESSAGE || commonStrings.GENERIC_ERROR)
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

  const handleRetry = () => {
    if (!suppliers || suppliers.length === 0) {
      setError(null)
      return
    }

    setPage(1)
    fetchData(
      1,
      suppliers,
      pickupLocation,
      carSpecs,
      _carType,
      gearbox,
      mileage,
      fuelPolicy,
      deposit,
      ranges,
      multimedia,
      rating,
      seats,
    ).catch(() => {
      /* errors handled inside fetchData */
    })
  }

  const renderSkeletons = () => {
    if (!(loading || carListLoading)) {
      return null
    }

    const count = rows.length === 0 ? (env.isMobile() ? 1 : 3) : 1

    return Array.from({ length: count }, (_item, index) => (
      <CarCardSkeleton key={`car-skeleton-${index}`} />
    ))
  }

  const canDisplayCars = ((from && to && pickupLocation && dropOffLocation) || hidePrice)

  const showEmptyState = !error
    && !loading
    && !carListLoading
    && !init
    && rows.length === 0
    && canDisplayCars
    && !boost

  return (
    <>
      <section className={`${className ? `${className} ` : ''}car-list`}>
        <ProfileAlert />

        {error && (
          <div className="car-list__state">
            <Alert
              severity="error"
              action={(
                <Button color="inherit" size="small" onClick={handleRetry}>
                  {commonStrings.RETRY}
                </Button>
              )}
            >
              {error}
            </Alert>
          </div>
        )}

        {showEmptyState && (
          <div className="car-list__state car-list__state--empty">
            <Typography variant="body1">{strings.EMPTY_LIST}</Typography>
          </div>
        )}

        {canDisplayCars && (
          <>
            {totalRecords > 0 && !boost && (
              <div className="car-list__summary">
                <div className="car-list__summary-title">
                  <span>{strings.TITLE_1}</span>
                  <span className="car-list__summary-brand">{commonStrings.BOOKCARS}</span>
                  <span>{strings.TITLE_2}</span>
                </div>
                <div className="car-list__summary-count">
                  {`(${totalRecords} ${totalRecords === 1 ? strings.TITLE_CAR_AVAILABLE : strings.TITLE_CARS_AVAILABLE})`}
                </div>
              </div>
            )}

            <div className="car-list__grid">
              {rows.map((car) => {
                const totalPrice = from && to ? bookcarsHelper.calculateTotalPrice(car, from, to) : 0

                const handleBook = () => {
                  if (!car._id) {
                    return
                  }

                  const rentalDays = Math.max(days, 1)
                  const safeTotal = Number.isFinite(totalPrice) && totalPrice > 0 ? totalPrice : 0
                  const unitPrice = rentalDays > 0 ? safeTotal / rentalDays : safeTotal

                  sendCheckoutEvent({
                    value: safeTotal,
                    currency: getDefaultAnalyticsCurrency(),
                    items: [
                      {
                        id: car._id,
                        name: car.name,
                        quantity: rentalDays,
                        price: unitPrice,
                        category: car.range,
                      },
                    ],
                    contentType: car.range,
                  })

                  navigate('/checkout', {
                    state: {
                      carId: car._id,
                      pickupLocationId: pickupLocation,
                      dropOffLocationId: dropOffLocation,
                      from,
                      to,
                    },
                  })
                }

                return (
                  <CarCard
                    key={car._id}
                    car={car}
                    days={days}
                    totalPrice={totalPrice}
                    language={language}
                    booking={booking}
                    hidePrice={hidePrice}
                    hideSupplier={hideSupplier}
                    pickupLocationName={pickupLocationName}
                    distance={distance}
                    onBook={handleBook}
                    showBoostBadge={!!boost}
                  />
                )
              })}
              {renderSkeletons()}
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
