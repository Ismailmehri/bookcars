import React, { useState, useEffect } from 'react'
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

  const _minDate = new Date()
  _minDate.setDate(_minDate.getDate() + 1)

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

      if (!endDate || endDate < minEndDate) {
        const newEndDate = new Date(startDate)
        newEndDate.setDate(startDate.getDate() + 3)
        setTo(newEndDate)
      }
    }
  }

  useEffect(() => {
    const _from = new Date()
    _from.setDate(_from.getDate() + 1)
    _from.setHours(10)
    _from.setMinutes(0)
    _from.setSeconds(0)
    _from.setMilliseconds(0)

    const _to = new Date(_from)
    _to.setDate(_to.getDate() + 3)

    setFrom(_from)
    setTo(_to)
  }, [])

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
      setFrom(date)
      setFromError(false)
      updateDateRange(date, to)
    } else {
      setFrom(undefined)
    }
  }

  const handleToDateChange = (date: Date | null) => {
    if (date) {
      const minEndDate = from ? new Date(from.getTime() + 24 * 60 * 60 * 1000) : _minDate
      if (date >= minEndDate) {
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
          minDate={_minDate}
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
          minDate={from ? new Date(from.getTime() + 24 * 60 * 60 * 1000) : _minDate}
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
