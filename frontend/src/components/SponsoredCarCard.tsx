import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Card, CardActions, CardContent, CardMedia, CircularProgress, Rating, Stack, Typography } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import * as CarService from '@/services/CarService'
import * as helper from '@/common/helper'
import { strings } from '@/lang/search'
import { getDefaultAnalyticsCurrency, sendCheckoutEvent } from '@/common/gtm'
import { strings as carStrings } from '@/lang/cars'
import { strings as commonStrings } from '@/lang/common'

type SponsoredCarCardProps = {
  payload?: bookcarsTypes.GetCarsPayload;
  from?: Date;
  to?: Date;
  pickupLocationId?: string;
  dropOffLocationId?: string;
  loading?: boolean;
}

const SponsoredCarCard = ({ payload, from, to, pickupLocationId, dropOffLocationId, loading }: SponsoredCarCardProps) => {
  const navigate = useNavigate()
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [car, setCar] = useState<bookcarsTypes.Car | null>(null)

  const days = useMemo(() => {
    if (!from || !to) {
      return 0
    }

    return bookcarsHelper.days(from, to)
  }, [from, to])

  useEffect(() => {
    let ignore = false

    const fetchSponsoredCar = async () => {
      if (!payload || !from || !to) {
        setCar(null)
        return
      }

      try {
        setIsFetching(true)
        setError(null)
        const result = await CarService.getBoostedCars(payload, 1, 1)
        if (ignore) {
          return
        }
        const boosted = result && result.length > 0 ? result[0].resultData : []
        setCar(boosted.length > 0 ? boosted[0] : null)
      } catch (err) {
        if (!ignore) {
          setError(strings.SPONSORED_ERROR)
        }
        helper.error(err)
      } finally {
        if (!ignore) {
          setIsFetching(false)
        }
      }
    }

    fetchSponsoredCar()

    return () => {
      ignore = true
    }
  }, [payload, from, to])

  if (loading && !car) {
    return (
      <Box sx={{ p: 3, borderRadius: 2, backgroundColor: 'common.white', boxShadow: 1, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={32} aria-label={strings.SPONSORED_LOADING} />
      </Box>
    )
  }

  if (isFetching) {
    return (
      <Box sx={{ p: 3, borderRadius: 2, backgroundColor: 'common.white', boxShadow: 1, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={32} aria-label={strings.SPONSORED_LOADING} />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    )
  }

  if (!car) {
    return (
      <Card elevation={0} sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            {strings.SPONSORED_TITLE}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {strings.SPONSORED_EMPTY}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const supplier = typeof car.supplier === 'object' ? car.supplier : undefined
  const supplierScore = supplier && typeof supplier.score === 'number' ? supplier.score : undefined
  const totalPrice = from && to ? bookcarsHelper.calculateTotalPrice(car, from, to) : car.dailyPrice
  const unitPrice = days > 0 ? totalPrice / days : totalPrice

  return (
    <Card elevation={0} sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardMedia
        component="img"
        height="220"
        image={bookcarsHelper.joinURL(env.CDN_CARS, car.image)}
        alt={car.name}
        loading="lazy"
      />
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
          <div>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
              {strings.SPONSORED_BADGE}
            </Typography>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 700 }}>
              {car.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {supplier?.fullName}
            </Typography>
          </div>
          {typeof supplierScore === 'number' && (
            <Rating
              value={Math.round(((supplierScore / 100) * 5) * 10) / 10}
              precision={0.1}
              readOnly
            />
          )}
        </Stack>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
          {bookcarsHelper.formatPrice(totalPrice, commonStrings.CURRENCY, env.DEFAULT_LANGUAGE)}
        </Typography>
        {days > 0 && (
          <Typography variant="body2" color="text.secondary">
            {strings.SPONSORED_PRICE_PER_DAY.replace('{value}', bookcarsHelper.formatPrice(unitPrice, commonStrings.CURRENCY, env.DEFAULT_LANGUAGE))}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => {
            if (car._id) {
              const safeTotal = Number.isFinite(totalPrice) && totalPrice > 0 ? totalPrice : 0
              const rentalDays = Math.max(days, 1)
              const safeUnit = rentalDays > 0 ? safeTotal / rentalDays : safeTotal

              sendCheckoutEvent({
                value: safeTotal,
                currency: getDefaultAnalyticsCurrency(),
                items: [
                  {
                    id: car._id,
                    name: car.name,
                    quantity: rentalDays,
                    price: safeUnit,
                    category: car.range,
                  },
                ],
                contentType: car.range,
              })
            }
            navigate('/checkout', {
              state: {
                carId: car._id,
                pickupLocationId,
                dropOffLocationId,
                from,
                to,
              },
            })
          }}
        >
          {carStrings.BOOK}
        </Button>
      </CardActions>
    </Card>
  )
}

export default SponsoredCarCard
