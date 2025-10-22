import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FormControl,
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { DateTimeValidationError } from '@mui/x-date-pickers'
import env from '@/config/env.config'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/search-form'
import * as UserService from '@/services/UserService'
import * as LocationService from '@/services/LocationService'
import LocationSelectList from '@/components/LocationSelectList'
import DateTimePicker from '@/components/DateTimePicker'
import { sendSearchEvent } from '@/common/gtm'

import '@/assets/css/search-form.css'

interface SearchFormProps {
  pickupLocation?: string
  dropOffLocation?: string
  ranges?: bookcarsTypes.CarRange[]
  onCancel?: () => void
}

const SearchForm = ({
  pickupLocation: __pickupLocation,
  dropOffLocation: __dropOffLocation,
  ranges: __ranges,
  onCancel,
}: SearchFormProps) => {
  const navigate = useNavigate()

  const minPickupDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    date.setHours(10, 0, 0, 0)
    return date
  }, [])

  const maxDropOffDate = useMemo(() => {
    const date = new Date()
    date.setMonth(date.getMonth() + env.MAX_BOOKING_MONTHS)
    date.setHours(20, 30, 0, 0)
    return date
  }, [])

  const maxPickupDate = useMemo(() => {
    const date = new Date(maxDropOffDate)
    date.setDate(date.getDate() - 1)
    if (date < minPickupDate) {
      return new Date(minPickupDate)
    }
    return date
  }, [maxDropOffDate, minPickupDate])

  const [pickupLocation, setPickupLocation] = useState('')
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<bookcarsTypes.Location | undefined>(undefined)
  const [dropOffLocation, setDropOffLocation] = useState('')
  const [selectedDropOffLocation, setSelectedDropOffLocation] = useState<bookcarsTypes.Location | undefined>(undefined)
  const [from, setFrom] = useState<Date>()
  const [to, setTo] = useState<Date>()
  const [sameLocation, setSameLocation] = useState(true)
  const [fromError, setFromError] = useState(false)
  const [toError, setToError] = useState(false)
  const [ranges, setRanges] = useState(bookcarsHelper.getAllRanges())

  const updateDateRange = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (startDate) {
      const minEndDate = new Date(startDate)
      minEndDate.setDate(startDate.getDate() + 1)

      if (minEndDate > maxDropOffDate) {
        setTo(undefined)
        setToError(true)
        return
      }

      const suggestedEndDate = new Date(startDate)
      suggestedEndDate.setDate(startDate.getDate() + 3)

      let newEndDate = endDate && endDate >= minEndDate ? new Date(endDate) : suggestedEndDate

      if (newEndDate < minEndDate) {
        newEndDate = new Date(minEndDate)
      }

      if (newEndDate > maxDropOffDate) {
        newEndDate = new Date(maxDropOffDate)
      }

      setTo(newEndDate)
      setToError(false)
    }
  }

  useEffect(() => {
    const defaultFrom = new Date(minPickupDate)
    defaultFrom.setHours(10, 0, 0, 0)

    const minDefaultTo = new Date(defaultFrom)
    minDefaultTo.setDate(minDefaultTo.getDate() + 1)

    let defaultTo = new Date(defaultFrom)
    defaultTo.setDate(defaultTo.getDate() + 3)

    if (defaultTo < minDefaultTo) {
      defaultTo = new Date(minDefaultTo)
    }

    if (defaultTo > maxDropOffDate) {
      defaultTo = new Date(maxDropOffDate)
    }

    setFrom(defaultFrom)
    setTo(defaultTo)
  }, [maxDropOffDate, minPickupDate])

  useEffect(() => {
    const init = async () => {
      if (__pickupLocation) {
        const location = await LocationService.getLocation(__pickupLocation)
        setSelectedPickupLocation(location)
        setPickupLocation(__pickupLocation)
        if (sameLocation) {
          setDropOffLocation(__pickupLocation)
        } else {
          setSameLocation(dropOffLocation === __pickupLocation)
        }
      }
    }
    init()
  }, [__pickupLocation, dropOffLocation, sameLocation])

  useEffect(() => {
    const init = async () => {
      if (__dropOffLocation) {
        const location = await LocationService.getLocation(__dropOffLocation)
        setSelectedDropOffLocation(location)
        setDropOffLocation(__dropOffLocation)
        setSameLocation(pickupLocation === __dropOffLocation)
      }
    }
    init()
  }, [__dropOffLocation, pickupLocation])

  useEffect(() => {
    setRanges(__ranges || bookcarsHelper.getAllRanges())
  }, [__ranges])

  const handlePickupLocationChange = async (values: bookcarsTypes.Option[]) => {
    const _pickupLocation = (values.length > 0 && values[0]._id) || ''
    setPickupLocation(_pickupLocation)

    if (_pickupLocation) {
      const location = await LocationService.getLocation(_pickupLocation)
      setSelectedPickupLocation(location)
    } else {
      setSelectedPickupLocation(undefined)
    }

    if (sameLocation) {
      setDropOffLocation(_pickupLocation)
    }
  }

  const handleSameLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSameLocation(e.target.checked)

    if (e.target.checked) {
      setDropOffLocation(pickupLocation)
    } else {
      setDropOffLocation('')
    }
  }

  const handleDropOffLocationChange = async (values: bookcarsTypes.Option[]) => {
    const _dropOffLocation = (values.length > 0 && values[0]._id) || ''
    setDropOffLocation(_dropOffLocation)

    if (_dropOffLocation) {
      const location = await LocationService.getLocation(_dropOffLocation)
      setSelectedDropOffLocation(location)
    } else {
      setSelectedDropOffLocation(undefined)
    }
  }

  const handleFromDateChange = (date: Date | null) => {
    if (date) {
      const pickupDate = date > maxPickupDate ? new Date(maxPickupDate) : date
      setFrom(pickupDate)
      setFromError(false)
      updateDateRange(pickupDate, to)
    } else {
      setFrom(undefined)
    }
  }

  const handleToDateChange = (date: Date | null) => {
    if (date) {
      const minEndDate = from ? new Date(from.getTime() + 24 * 60 * 60 * 1000) : minPickupDate

      if (minEndDate > maxDropOffDate) {
        setToError(true)
        return
      }

      if (date >= minEndDate && date <= maxDropOffDate) {
        setTo(date)
        setToError(false)
      }
    } else {
      setTo(undefined)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!pickupLocation || !dropOffLocation || !from || !to || fromError || toError) {
      return
    }

    const searchTerm = selectedPickupLocation?.name || selectedDropOffLocation?.name || commonStrings.PICK_UP_LOCATION

    sendSearchEvent({
      searchTerm,
      pickupLocationId: pickupLocation,
      dropOffLocationId: dropOffLocation,
      startDate: from,
      endDate: to,
      sameLocation,
      filters: ranges.length ? { ranges } : undefined,
    })

    setTimeout(navigate, 0, '/search', {
      state: {
        pickupLocationId: pickupLocation,
        dropOffLocationId: dropOffLocation,
        from,
        to,
        ranges,
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="home-search-form">
      <FormControl className="pickup-location">
        <LocationSelectList
          label={commonStrings.PICK_UP_LOCATION}
          hidePopupIcon
          customOpen={env.isMobile()}
          init={!env.isMobile()}
          required
          variant="outlined"
          value={selectedPickupLocation}
          onChange={handlePickupLocationChange}
        />
      </FormControl>
      <FormControl className="from">
        <DateTimePicker
          label={strings.PICK_UP_DATE}
          value={from}
          minDate={minPickupDate}
          maxDate={maxPickupDate}
          variant="outlined"
          required
          onChange={handleFromDateChange}
          onError={(err: DateTimeValidationError) => {
            setFromError(!!err)
          }}
          language={UserService.getLanguage()}
        />
      </FormControl>
      <FormControl className="to">
        <DateTimePicker
          label={strings.DROP_OFF_DATE}
          value={to}
          minDate={from ? new Date(from.getTime() + 24 * 60 * 60 * 1000) : minPickupDate}
          maxDate={maxDropOffDate}
          variant="outlined"
          required
          onChange={handleToDateChange}
          onError={(err: DateTimeValidationError) => {
            setToError(!!err)
          }}
          language={UserService.getLanguage()}
        />
      </FormControl>
      <Button type="submit" variant="contained" className="btn-search">
        {commonStrings.SEARCH}
      </Button>
      {onCancel && (
        <Button
          variant="outlined"
          color="inherit"
          className="btn-cancel"
          onClick={() => {
            onCancel()
          }}
        >
          {commonStrings.CANCEL}
        </Button>
      )}
      {!sameLocation && (
        <FormControl className="drop-off-location">
          <LocationSelectList
            label={commonStrings.DROP_OFF_LOCATION}
            hidePopupIcon
            customOpen={env.isMobile()}
            init={!env.isMobile()}
            value={selectedDropOffLocation}
            required
            variant="outlined"
            onChange={handleDropOffLocationChange}
          />
        </FormControl>
      )}
      <FormControl className="chk-same-location">
        <FormControlLabel control={<Checkbox checked={sameLocation} disabled onChange={handleSameLocationChange} />} label={strings.DROP_OFF} />
      </FormControl>
    </form>
  )
}

export default SearchForm
