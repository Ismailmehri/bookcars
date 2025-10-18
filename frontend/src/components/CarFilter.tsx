import React, { useState, useEffect, useMemo } from 'react'
import { FormControl, Button, FormControlLabel, Checkbox } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { DateTimeValidationError } from '@mui/x-date-pickers'
import { format } from 'date-fns'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/search-form'
import * as UserService from '@/services/UserService'
import LocationSelectList from './LocationSelectList'
import DateTimePicker from './DateTimePicker'
import Accordion from './Accordion'

import '@/assets/css/car-filter.css'

interface CarFilterProps {
  from: Date
  to: Date
  pickupLocation: bookcarsTypes.Location
  dropOffLocation: bookcarsTypes.Location
  className?: string
  suppliers?: string[]
  accordion?: boolean
  collapse?: boolean
  onSubmit: bookcarsTypes.CarFilterSubmitEvent
}

const CarFilter = ({
  from: filterFrom,
  to: filterTo,
  pickupLocation: filterPickupLocation,
  dropOffLocation: filterDropOffLocation,
  className,
  suppliers,
  accordion,
  collapse,
  onSubmit
}: CarFilterProps) => {
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

  const [from, setFrom] = useState<Date | undefined>(filterFrom)
  const [to, setTo] = useState<Date | undefined>(filterTo)
  const [pickupLocation, setPickupLocation] = useState<bookcarsTypes.Location | null | undefined>(filterPickupLocation)
  const [dropOffLocation, setDropOffLocation] = useState<bookcarsTypes.Location | null | undefined>(filterDropOffLocation)
  const [sameLocation, setSameLocation] = useState(filterPickupLocation === filterDropOffLocation)
  const [fromError, setFromError] = useState(false)
  const [toError, setToError] = useState(false)
  const [offsetHeight, setOffsetHeight] = useState(0)
  const [edit, setEdit] = useState(false)

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
    setPickupLocation(filterPickupLocation)
  }, [filterPickupLocation])

  useEffect(() => {
    setDropOffLocation(filterDropOffLocation)
  }, [filterDropOffLocation])

  useEffect(() => {
    setSameLocation(pickupLocation?._id === dropOffLocation?._id)
  }, [pickupLocation, dropOffLocation])

  useEffect(() => {
    if (sameLocation) {
      setOffsetHeight(0)
    } else {
      setOffsetHeight(56)
    }
  }, [sameLocation])

  const handlePickupLocationChange = (values: bookcarsTypes.Option[]) => {
    const _pickupLocation = (values.length > 0 && values[0]) as bookcarsTypes.Location || null
    setPickupLocation(_pickupLocation)
    if (sameLocation) {
      setDropOffLocation(_pickupLocation)
    }
  }

  const handleSameLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSameLocation(e.target.checked)
    if (e.target.checked) {
      setDropOffLocation(pickupLocation)
    }
  }

  const handleDropOffLocationChange = (values: bookcarsTypes.Option[]) => {
    setDropOffLocation((values.length > 0 && values[0]) as bookcarsTypes.Location || null)
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

  const handleCopyLink = () => {
    if (!pickupLocation) return

    const domain = window.location.origin
    let url = `${domain}/search/${pickupLocation.slug}`

    if (suppliers && suppliers.length > 0) {
      url += `/${suppliers[0]}`
    }

    navigator.clipboard.writeText(url)
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

    if (onSubmit) {
      const filter: bookcarsTypes.CarFilter = {
        pickupLocation, dropOffLocation, from, to
      }
      onSubmit(filter)
    }
  }

  const renderForm = () => (
    <form
      className={`${className ? `${className} ` : ''}car-filter`}
      onSubmit={handleSubmit}
    >
      <div className="field">
        {!edit && (
          <>
            <span className="location">{pickupLocation?.name}</span>
            <span className="date">{from && format(from, 'dd.MM.yyyy HH:mm')}</span>
          </>
        )}
        {edit && (
          <>
            <FormControl fullWidth className="control">
              <LocationSelectList
                label={commonStrings.PICK_UP_LOCATION}
                hidePopupIcon
                customOpen={env.isMobile()}
                init={!env.isMobile()}
                required
                variant="standard"
                value={pickupLocation as bookcarsTypes.Location}
                onChange={handlePickupLocationChange}
              />
            </FormControl>
            <FormControl fullWidth className="control">
              <DateTimePicker
                label={strings.PICK_UP_DATE}
                value={from}
                minDate={minPickupDate}
                maxDate={maxPickupDate}
                variant="standard"
                required
                onChange={handleFromDateChange}
                onError={(err: DateTimeValidationError) => {
                  setFromError(!!err)
                }}
                language={UserService.getLanguage()}
              />
            </FormControl>
            <FormControl fullWidth className="chk-same-location">
              <FormControlLabel control={<Checkbox disabled checked={sameLocation} onChange={handleSameLocationChange} />} label={strings.DROP_OFF} />
            </FormControl>
          </>
        )}
      </div>
      <span className="separator" />
      <div className="field">
        {!edit && (
          <>
            <span className="location">{dropOffLocation?.name}</span>
            <span className="date">{to && format(to, 'dd.MM.yyyy HH:mm')}</span>
          </>
        )}
        {edit && (
          <>
            <FormControl fullWidth className="control">
              <LocationSelectList
                label={commonStrings.DROP_OFF_LOCATION}
                value={dropOffLocation as bookcarsTypes.Location}
                hidePopupIcon
                customOpen={env.isMobile()}
                init={!env.isMobile()}
                required
                readOnly={sameLocation}
                variant="standard"
                onChange={handleDropOffLocationChange}
              />
            </FormControl>
            <FormControl fullWidth className="control drop-off-date">
              <DateTimePicker
                label={strings.DROP_OFF_DATE}
                value={to}
                minDate={from ? new Date(from.getTime() + 24 * 60 * 60 * 1000) : minPickupDate}
                maxDate={maxDropOffDate}
                variant="standard"
                required
                onChange={handleToDateChange}
                onError={(err: DateTimeValidationError) => {
                  setToError(!!err)
                }}
                language={UserService.getLanguage()}
              />
            </FormControl>
          </>
        )}
      </div>
      <div className="form-buttons">
        {!edit && (
          <Button variant="contained" className="btn-primary btn-edit" onClick={() => setEdit(true)}>
            {commonStrings.EDIT}
          </Button>
        )}
        {edit && (
          <>
            <Button type="submit" variant="contained" className="btn-primary btn-search">
              {commonStrings.SEARCH}
            </Button>
            <Button variant="outlined" className="btn-cancel" onClick={() => setEdit(false)}>
              {commonStrings.CANCEL}
            </Button>
          </>
        )}
      </div>
    </form>
  )

  return (
    <>
      {accordion && (
        <Accordion
          title={commonStrings.LOCATION_TERM}
          collapse={collapse}
          offsetHeight={offsetHeight}
          className={`${className ? `${className} ` : ''}car-filter`}
        >
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth className="pickup-location">
              <LocationSelectList
                label={commonStrings.PICK_UP_LOCATION}
                hidePopupIcon
                customOpen={env.isMobile()}
                init={!env.isMobile()}
                required
                variant="standard"
                value={pickupLocation as bookcarsTypes.Location}
                onChange={handlePickupLocationChange}
              />
            </FormControl>
            {!sameLocation && (
              <FormControl fullWidth className="drop-off-location">
                <LocationSelectList
                  label={commonStrings.DROP_OFF_LOCATION}
                  value={dropOffLocation as bookcarsTypes.Location}
                  hidePopupIcon
                  customOpen={env.isMobile()}
                  init={!env.isMobile()}
                  required
                  variant="standard"
                  onChange={handleDropOffLocationChange}
                />
              </FormControl>
            )}
            <FormControl fullWidth className="from">
              <DateTimePicker
                label={strings.PICK_UP_DATE}
                value={from}
                minDate={minPickupDate}
                maxDate={maxPickupDate}
                variant="standard"
                required
                onChange={handleFromDateChange}
                onError={(err: DateTimeValidationError) => {
                  setFromError(!!err)
                }}
                language={UserService.getLanguage()}
              />
            </FormControl>
            <FormControl fullWidth className="to">
              <DateTimePicker
                label={strings.DROP_OFF_DATE}
                value={to}
                minDate={from ? new Date(from.getTime() + 24 * 60 * 60 * 1000) : minPickupDate}
                maxDate={maxDropOffDate}
                variant="standard"
                required
                onChange={handleToDateChange}
                onError={(err: DateTimeValidationError) => {
                  setToError(!!err)
                }}
                language={UserService.getLanguage()}
              />
            </FormControl>
            <FormControl fullWidth className="fc-search">
              <Button type="submit" variant="contained" className="btn-primary btn-search">
                {commonStrings.SEARCH}
              </Button>
            </FormControl>
            <FormControl fullWidth className="chk-same-location">
              <FormControlLabel control={<Checkbox disabled checked={sameLocation} onChange={handleSameLocationChange} />} label={strings.DROP_OFF} />
            </FormControl>
            <div className="copy-link">
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyLink}
                variant="outlined"
                size="small"
              >
                {commonStrings.COPY_LINK}
              </Button>
            </div>
          </form>
        </Accordion>
      )}

      {!accordion && renderForm()}
    </>
  )
}

export default CarFilter
