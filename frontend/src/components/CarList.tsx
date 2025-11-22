import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Typography } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'
import Const from '@/config/const'
import * as helper from '@/common/helper'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/cars'
import * as CarService from '@/services/CarService'
import * as UserService from '@/services/UserService'
import Pager from './Pager'
import '@/assets/css/car-list.css'
import { sendCheckoutEvent } from '@/common/gtm'
import ProfileAlert from './ProfileAlert'
import { buildCarListSectionClassName } from './car-list.utils'
import VirtualizedList from './VirtualizedList'
import CarCard from './CarCard'
import {
  buildCarCardViewModel,
  getCheckoutPayload,
} from './car-list.view-model'

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
  carType: carTypeFilters,
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
  minPrice,
  maxPrice,
  boost = false,
  onLoad,
}: CarListProps) => {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(UserService.getLanguage() ?? env.DEFAULT_LANGUAGE)
  const [init, setInit] = useState(true)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [rows, setRows] = useState<bookcarsTypes.Car[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLanguage(UserService.getLanguage())
  }, [])

  const isMobileLayout = env.isMobile()
  const sectionClassName = useMemo(
    () => buildCarListSectionClassName({ className, isMobile: isMobileLayout }),
    [className, isMobileLayout],
  )

  const handleFetch = useCallback(async (
    targetPage: number,
    supplierFilter?: string[],
    pickup?: string,
    specs?: bookcarsTypes.CarSpecs,
    carTypeFilter?: string[],
    gearboxes?: string[],
    mileages?: string[],
    fuelPolicies?: string[],
    depositFilter?: number,
    rangeFilters?: string[],
    multimediaFilters?: string[],
    ratingFilter?: number,
    seatsFilter?: number,
    minPriceFilter?: number,
    maxPriceFilter?: number,
  ) => {
    try {
      setError(null)
      setLoading(true)
      const payload: bookcarsTypes.GetCarsPayload = {
        suppliers: supplierFilter ?? [],
        pickupLocation: pickup,
        carSpecs: specs,
        carType: carTypeFilter,
        gearbox: gearboxes,
        mileage: mileages,
        fuelPolicy: fuelPolicies,
        deposit: depositFilter,
        ranges: rangeFilters,
        multimedia: multimediaFilters,
        rating: ratingFilter,
        seats: seatsFilter,
        startDate: from,
        endDate: to,
        minPrice: minPriceFilter,
        maxPrice: maxPriceFilter,
      }

      const data = boost
        ? await CarService.getBoostedCars(payload, targetPage, env.CARS_PAGE_SIZE)
        : await CarService.getCars(payload, targetPage, env.CARS_PAGE_SIZE)

      const response = data?.[0] ?? { pageInfo: { totalRecords: 0 }, resultData: [] }
      const nextTotalRecords = Array.isArray(response.pageInfo) && response.pageInfo.length > 0
        ? response.pageInfo[0].totalRecords
        : 0

      const nextRows = (env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || isMobileLayout)
        ? (targetPage === 1 ? response.resultData : [...rows, ...response.resultData])
        : response.resultData

      setRows(nextRows)
      setTotalRecords(nextTotalRecords)
      setHasMore(response.resultData.length > 0 && nextRows.length < nextTotalRecords)
      onLoad?.({ rows: response.resultData, rowCount: nextTotalRecords })
    } catch (err) {
      helper.error(err)
      setError(commonStrings.GENERIC_ERROR)
    } finally {
      setLoading(false)
      setInit(false)
    }
  }, [boost, from, to, isMobileLayout, onLoad, rows])

  useEffect(() => {
    if (env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || isMobileLayout) {
      const element = document.body
      if (element) {
        element.onscroll = () => {
          if (hasMore && !loading && window.scrollY > 0
            && window.scrollY + window.innerHeight + env.INFINITE_SCROLL_OFFSET >= document.body.scrollHeight) {
            setLoading(true)
            setPage((p) => p + 1)
          }
        }
      }

      return () => {
        if (element) {
          element.onscroll = null
        }
      }
    }

    return undefined
  }, [hasMore, loading, isMobileLayout])

  useEffect(() => {
    if (suppliers) {
      if (suppliers.length > 0) {
        handleFetch(
          page,
          suppliers,
          pickupLocation,
          carSpecs,
          carTypeFilters,
          gearbox,
          mileage,
          fuelPolicy,
          deposit,
          ranges,
          multimedia,
          rating,
          seats,
          minPrice,
          maxPrice,
        )
      } else {
        setRows([])
        setHasMore(false)
        onLoad?.({ rows: [], rowCount: 0 })
        setInit(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, suppliers, pickupLocation, carSpecs, carTypeFilters, gearbox, mileage, fuelPolicy, deposit, ranges, multimedia, rating, seats, from, to, minPrice, maxPrice])

  useEffect(() => {
    if (cars) {
      setRows(cars)
      setHasMore(false)
      onLoad?.({ rows: cars, rowCount: cars.length })
      setLoading(false)
      setInit(false)
    }
  }, [cars, onLoad])

  useEffect(() => {
    setPage(1)
  }, [suppliers, pickupLocation, carSpecs, carTypeFilters, gearbox, mileage, fuelPolicy, deposit, ranges, multimedia, rating, seats, from, to, minPrice, maxPrice])

  useEffect(() => {
    if (reload) {
      setPage(1)
      handleFetch(
        1,
        suppliers,
        pickupLocation,
        carSpecs,
        carTypeFilters,
        gearbox,
        mileage,
        fuelPolicy,
        deposit,
        ranges,
        multimedia,
        rating,
        seats,
        minPrice,
        maxPrice,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload])

  const viewModels = useMemo(
    () => rows.map((car) => buildCarCardViewModel(car, { from, to, language })),
    [rows, from, to, language],
  )

  const cards = useMemo(
    () => rows.map((car, index) => ({ car, viewModel: viewModels[index] })),
    [rows, viewModels],
  )

  const handleBook = useCallback((car: bookcarsTypes.Car, viewModel: ReturnType<typeof buildCarCardViewModel>) => {
    if (car._id) {
      sendCheckoutEvent(getCheckoutPayload(car, viewModel))
    }

    navigate('/checkout', {
      state: {
        carId: car._id,
        pickupLocationId: pickupLocation,
        dropOffLocationId: dropOffLocation,
        from,
        to,
      },
    })
  }, [navigate, pickupLocation, dropOffLocation, from, to])

  const renderCard = useCallback(
    (item: { car: bookcarsTypes.Car; viewModel: ReturnType<typeof buildCarCardViewModel> }) => (
      <CarCard
        car={item.car}
        booking={booking}
        viewModel={item.viewModel}
        pickupLocationName={pickupLocationName}
        distance={distance}
        hidePrice={hidePrice}
        hideSupplier={hideSupplier}
        boost={boost}
        language={language}
        onBook={() => handleBook(item.car, item.viewModel)}
      />
    ),
    [booking, boost, distance, handleBook, hidePrice, hideSupplier, language, pickupLocationName],
  )

  const isLoading = loading || carListLoading
  const showResults = rows.length > 0 && ((from && to && pickupLocation && dropOffLocation) || hidePrice)

  return (
    <>
      <section className={sectionClassName}>
        <ProfileAlert />

        {isLoading && (
          <div className="car-list-loading" role="status" aria-live="polite">{commonStrings.LOADING}</div>
        )}

        {error && (
          <Card variant="outlined" className="car-list-error" role="alert">
            <CardContent>
              <Typography color="error">{error}</Typography>
            </CardContent>
          </Card>
        )}

        {rows.length === 0 && !isLoading && !init && !error && (
          <Card variant="outlined" className="empty-list">
            <CardContent>
              <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
            </CardContent>
          </Card>
        )}

        {showResults && (
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

            <div className="car-list-wrapper" role="list">
              {cards.length > 8 ? (
                <VirtualizedList
                  items={cards}
                  itemHeight={isMobileLayout ? 660 : 620}
                  containerHeight={isMobileLayout ? 760 : 980}
                  className="car-list-virtualized"
                  ariaLabel="Résultats véhicules"
                  itemKey={(item) => item.car._id ?? item.car.name}
                  renderItem={(item) => renderCard(item)}
                  emptyPlaceholder={(
                    <Card variant="outlined" className="empty-list">
                      <CardContent>
                        <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
                      </CardContent>
                    </Card>
                  )}
                />
              ) : (
                cards.map((item) => (
                  <div key={item.car._id ?? item.car.name} className="car-list-item" role="listitem">
                    {renderCard(item)}
                  </div>
                ))
              )}
            </div>

            {!isMobileLayout && env.PAGINATION_MODE === Const.PAGINATION_MODE.CLASSIC && !hidePrice && totalRecords > env.CARS_PAGE_SIZE && (
              <Pager
                page={page}
                pageCount={Math.ceil(totalRecords / env.CARS_PAGE_SIZE)}
                onChange={(_page) => {
                  setPage(_page)
                  window.scrollTo(0, 0)
                }}
              />
            )}
          </>
        )}
      </section>
    </>
  )
}

export default React.memo(CarList)
