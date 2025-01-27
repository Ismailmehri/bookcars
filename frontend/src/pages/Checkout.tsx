import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import {
  DirectionsCar as CarIcon,
  Person as DriverIcon,
  EventSeat as BookingIcon,
  Settings as PaymentOptionsIcon,
} from '@mui/icons-material'
import validator from 'validator'
import { format, intervalToDuration } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CarList from '@/components/CarList'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import * as BookingService from '@/services/BookingService'
import { strings as commonStrings } from '@/lang/common'
import { strings as csStrings } from '@/lang/cars'
import { strings } from '@/lang/checkout'
import * as helper from '@/common/helper'
import * as UserService from '@/services/UserService'
import * as CarService from '@/services/CarService'
import * as LocationService from '@/services/LocationService'
import * as StripeService from '@/services/StripeService'
import Layout from '@/components/Layout'
import Error from '@/components/Error'
import DatePicker from '@/components/DatePicker'
import ReCaptchaProvider from '@/components/ReCaptchaProvider'
import NoMatch from './NoMatch'
import Info from './Info'

import '@/assets/css/checkout.css'
import { sendPurchaseEvent } from '@/common/gtm'

const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY)

const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [user, setUser] = useState<bookcarsTypes.User>()
  const [car, setCar] = useState<bookcarsTypes.Car>()
  const [pickupLocation, setPickupLocation] = useState<bookcarsTypes.Location>()
  const [dropOffLocation, setDropOffLocation] = useState<bookcarsTypes.Location>()
  const [from, setFrom] = useState<Date>()
  const [to, setTo] = useState<Date>()
  const [visible, setVisible] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [language, setLanguage] = useState(env.DEFAULT_LANGUAGE)
  const [noMatch, setNoMatch] = useState(false)
  const [price, setPrice] = useState(0)
  const [cancellation, setCancellation] = useState(false)
  const [amendments, setAmendments] = useState(false)
  const [theftProtection, setTheftProtection] = useState(false)
  const [collisionDamageWaiver, setCollisionDamageWaiver] = useState(false)
  const [fullInsurance, setFullInsurance] = useState(false)
  const [additionalDriver, setAdditionalDriver] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [addiontalDriverFullName, setAddiontalDriverFullName] = useState('')
  const [addiontalDriverEmail, setAddiontalDriverEmail] = useState('')
  const [addiontalDriverPhone, setAddiontalDriverPhone] = useState('')
  const [addiontalDriverBirthDate, setAddiontalDriverBirthDate] = useState<Date>()
  const [addiontalDriverEmailValid, setAddiontalDriverEmailValid] = useState(true)
  const [addiontalDriverPhoneValid, setAddiontalDriverPhoneValid] = useState(true)
  const [addiontalDriverBirthDateValid, setAddiontalDriverBirthDateValid] = useState(true)
  const [payLater, setPayLater] = useState(true)
  const [adManuallyChecked, setAdManuallyChecked] = useState(false)
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)

  const adRequired = true

  const [paymentFailed, setPaymentFailed] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string>()
  const [sessionId, setSessionId] = useState<string>()

  const _fr = language === 'fr'
  const _locale = _fr ? fr : enUS
  const _format = _fr ? 'eee d LLL yyyy kk:mm' : 'eee, d LLL yyyy, p'
  const bookingDetailHeight = env.SUPPLIER_IMAGE_HEIGHT + 10
  const days = bookcarsHelper.days(from, to)
  const daysLabel = from && to && `
  ${helper.getDaysShort(days)} (${bookcarsHelper.capitalize(
    format(from, _format, { locale: _locale }),
  )} 
  - ${bookcarsHelper.capitalize(format(to, _format, { locale: _locale }))})`

  const handleCancellationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (car && from && to) {
      const _cancellation = e.target.checked
      const options: bookcarsTypes.CarOptions = {
        cancellation: _cancellation,
        amendments,
        theftProtection,
        collisionDamageWaiver,
        fullInsurance,
        additionalDriver,
      }
      const _price = bookcarsHelper.calculateTotalPrice(car, from, to, options)

      setCancellation(_cancellation)
      setPrice(_price)
    }
  }

  const handleAmendmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (car && from && to) {
      const _amendments = e.target.checked
      const options: bookcarsTypes.CarOptions = {
        cancellation,
        amendments: _amendments,
        theftProtection,
        collisionDamageWaiver,
        fullInsurance,
        additionalDriver,
      }
      const _price = bookcarsHelper.calculateTotalPrice(car, from, to, options)

      setAmendments(_amendments)
      setPrice(_price)
    }
  }

  const handleAdditionalDriverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (car && from && to) {
      const _additionalDriver = e.target.checked
      const options: bookcarsTypes.CarOptions = {
        cancellation,
        amendments,
        theftProtection,
        collisionDamageWaiver,
        fullInsurance,
        additionalDriver: _additionalDriver,
      }
      const _price = bookcarsHelper.calculateTotalPrice(car, from, to, options)

      setAdditionalDriver(_additionalDriver)
      setPrice(_price)
      setAdManuallyChecked(_additionalDriver)
    }
  }

  // additionalDriver
  const _validateEmail = (_email?: string) => {
    if (_email) {
      if (validator.isEmail(_email)) {
        setAddiontalDriverEmailValid(true)
        return true
      }
      setAddiontalDriverEmailValid(false)
      return false
    }
    setAddiontalDriverEmailValid(true)
    return false
  }

  const _validatePhone = (_phone?: string) => {
    if (_phone) {
      const _phoneValid = validator.isMobilePhone(_phone)
      setAddiontalDriverPhoneValid(_phoneValid)

      return _phoneValid
    }
    setAddiontalDriverPhoneValid(true)

    return true
  }

  const _validateBirthDate = (date?: Date) => {
    if (car && date && bookcarsHelper.isDate(date)) {
      const now = new Date()
      const sub = intervalToDuration({ start: date, end: now }).years ?? 0
      const _birthDateValid = sub >= car.minimumAge

      setAddiontalDriverBirthDateValid(_birthDateValid)
      return _birthDateValid
    }
    setAddiontalDriverBirthDateValid(true)
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      if (!car || !pickupLocation || !dropOffLocation || !from || !to) {
        helper.error()
        return
      }

      if (adManuallyChecked && additionalDriver) {
        const _emailValid = _validateEmail(addiontalDriverEmail)
        if (!_emailValid) {
          return
        }

        const _phoneValid = _validatePhone(addiontalDriverPhone)
        if (!_phoneValid) {
          return
        }

        const _birthDateValid = _validateBirthDate(addiontalDriverBirthDate)
        if (!_birthDateValid) {
          return
        }
      }

      setOpenConfirmationDialog(true)
    } catch (err) {
      helper.error(err)
    }
  }

  const handleConfirmReservation = async () => {
    try {
      setLoading(true)
      setPaymentFailed(false)

      let driver: bookcarsTypes.User | undefined
      let _additionalDriver: bookcarsTypes.AdditionalDriver | undefined

      const booking: bookcarsTypes.Booking = {
        supplier: car?.supplier._id as string,
        car: car ? car._id : '',
        driver: authenticated ? user?._id : undefined,
        pickupLocation: pickupLocation ? pickupLocation._id : '',
        dropOffLocation: dropOffLocation ? dropOffLocation._id : '',
        from: from || new Date(),
        to: to || new Date(),
        status: bookcarsTypes.BookingStatus.Pending,
        cancellation,
        amendments,
        theftProtection,
        collisionDamageWaiver,
        fullInsurance,
        additionalDriver,
        price,
      }

      if (adRequired && additionalDriver && addiontalDriverBirthDate) {
        _additionalDriver = {
          fullName: addiontalDriverFullName,
          email: addiontalDriverEmail,
          phone: addiontalDriverPhone,
          birthDate: addiontalDriverBirthDate,
        }
      }

      //
      // Stripe Payment Gateway
      //
      let _customerId: string | undefined
      let _sessionId: string | undefined
      if (!payLater) {
        const payload: bookcarsTypes.CreatePaymentPayload = {
          amount: price,
          currency: env.STRIPE_CURRENCY_CODE,
          locale: language,
          receiptEmail: (!authenticated ? driver?.email : user?.email) as string,
          name: `${car?.name} 
          - ${daysLabel} 
          - ${pickupLocation?._id === dropOffLocation?._id ? pickupLocation?.name : `${pickupLocation?.name} - ${dropOffLocation?.name}`}`,
          description: 'BookCars Web Service',
          customerName: (!authenticated ? driver?.fullName : user?.fullName) as string,
        }
        const res = await StripeService.createCheckoutSession(payload)
        setClientSecret(res.clientSecret)
        _sessionId = res.sessionId
        _customerId = res.customerId
      }

      const payload: bookcarsTypes.CheckoutPayload = {
        driver,
        booking,
        additionalDriver: _additionalDriver,
        payLater,
        sessionId: _sessionId,
        customerId: _customerId,
      }

      const { status, bookingId: _bookingId } = await BookingService.checkout(payload)
      setLoading(false)

      if (status === 200) {
        if (payLater) {
          sendPurchaseEvent(_bookingId, price, 'TND', [{ id: car?._id,
            name: car?.name,
            quantity: days,
            price: car?.dailyPrice }])
          setVisible(false)
          setSuccess(true)
        }
        setBookingId(_bookingId)
        setSessionId(_sessionId)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    } finally {
      setLoading(false)
      setOpenConfirmationDialog(false)
    }
  }

  const handleCloseConfirmationDialog = () => {
    setOpenConfirmationDialog(false)
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    setUser(_user)
    setAuthenticated(_user !== undefined)
    setLanguage(UserService.getLanguage())

    const { state } = location
    if (!state) {
      setNoMatch(true)
      return
    }

    const { carId } = state
    const { pickupLocationId } = state
    const { dropOffLocationId } = state
    const { from: _from } = state
    const { to: _to } = state

    if (!carId || !pickupLocationId || !dropOffLocationId || !_from || !_to) {
      setNoMatch(true)
      return
    }

    let _car
    let _pickupLocation
    let _dropOffLocation

    try {
      _car = await CarService.getCar(carId)
      if (!_car) {
        setNoMatch(true)
        return
      }

      _pickupLocation = await LocationService.getLocation(pickupLocationId)

      if (!_pickupLocation) {
        setNoMatch(true)
        return
      }

      if (dropOffLocationId !== pickupLocationId) {
        _dropOffLocation = await LocationService.getLocation(dropOffLocationId)
      } else {
        _dropOffLocation = _pickupLocation
      }

      if (!_dropOffLocation) {
        setNoMatch(true)
        return
      }

      const _price = bookcarsHelper.calculateTotalPrice(_car, _from, _to)

      const included = (val: number) => val === 0

      setCar(_car)
      setPrice(_price)
      setPickupLocation(_pickupLocation)
      setDropOffLocation(_dropOffLocation)
      setFrom(_from)
      setTo(_to)
      setCancellation(included(_car.cancellation))
      setAmendments(included(_car.amendments))
      setTheftProtection(included(_car.theftProtection))
      setCollisionDamageWaiver(included(_car.collisionDamageWaiver))
      setFullInsurance(included(_car.fullInsurance))
      setVisible(true)
    } catch (err) {
      helper.error(err)
    }
  }

  return (
    <ReCaptchaProvider>
      <Layout onLoad={onLoad} strict={false}>
        {visible && car && from && to && pickupLocation && dropOffLocation && (
          <div className="booking">
            <Paper className="booking-form" elevation={10}>
              <h1 className="booking-form-title">
                {' '}
                {strings.BOOKING_HEADING}
                {' '}
              </h1>
              <form onSubmit={handleSubmit}>
                <div>
                  <CarList
                    from={from}
                    to={to}
                    cars={[car]}
                    pickupLocationName={pickupLocation.name}
                    hidePrice
                    sizeAuto
                  />

                  <div className="booking-options-container">
                    <div className="booking-info">
                      <BookingIcon />
                      <span>{strings.BOOKING_OPTIONS}</span>
                    </div>
                    <div className="booking-options">
                      <FormControl fullWidth margin="dense">
                        <FormControlLabel
                          disabled={car.cancellation === -1 || car.cancellation === 0 || !!clientSecret}
                          control={<Switch checked={cancellation} onChange={handleCancellationChange} color="primary" />}
                          label={(
                            <span>
                              <span className="booking-option-label">{csStrings.CANCELLATION}</span>
                              <span className="booking-option-value">{helper.getCancellationOption(car.cancellation, language)}</span>
                            </span>
                          )}
                        />
                      </FormControl>

                      <FormControl fullWidth margin="dense">
                        <FormControlLabel
                          disabled={car.amendments === -1 || car.amendments === 0 || !!clientSecret}
                          control={<Switch checked={amendments} onChange={handleAmendmentsChange} color="primary" />}
                          label={(
                            <span>
                              <span className="booking-option-label">{csStrings.AMENDMENTS}</span>
                              <span className="booking-option-value">{helper.getAmendmentsOption(car.amendments, language)}</span>
                            </span>
                          )}
                        />
                      </FormControl>
                      <FormControl fullWidth margin="dense">
                        <FormControlLabel
                          disabled={car.additionalDriver === -1 || !!clientSecret}
                          control={<Switch checked={additionalDriver} onChange={handleAdditionalDriverChange} color="primary" />}
                          label={(
                            <span>
                              <span className="booking-option-label">{csStrings.ADDITIONAL_DRIVER}</span>
                              <span className="booking-option-value">{helper.getAdditionalDriverOption(car.additionalDriver, days, language)}</span>
                            </span>
                          )}
                        />
                      </FormControl>
                    </div>
                  </div>

                  <div className="booking-details-container">
                    <div className="booking-info">
                      <CarIcon />
                      <span>{strings.BOOKING_DETAILS}</span>
                    </div>
                    <div className="booking-details">
                      <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                        <span className="booking-detail-title">{strings.DAYS}</span>
                        <div className="booking-detail-value">
                          {daysLabel}
                        </div>
                      </div>
                      <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                        <span className="booking-detail-title">{commonStrings.PICK_UP_LOCATION}</span>
                        <div className="booking-detail-value">{pickupLocation.name}</div>
                      </div>
                      <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                        <span className="booking-detail-title">{commonStrings.DROP_OFF_LOCATION}</span>
                        <div className="booking-detail-value">{dropOffLocation.name}</div>
                      </div>
                      <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                        <span className="booking-detail-title">{strings.CAR}</span>
                        <div className="booking-detail-value">{`${car.name} (${bookcarsHelper.formatPrice(price / days, commonStrings.CURRENCY, language)}${commonStrings.DAILY})`}</div>
                      </div>
                      <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                        <span className="booking-detail-title">{commonStrings.SUPPLIER}</span>
                        <div className="booking-detail-value">
                          <div className="car-supplier">
                            <img src={bookcarsHelper.joinURL(env.CDN_USERS, car.supplier.avatar)} alt={car.supplier.fullName} style={{ height: env.SUPPLIER_IMAGE_HEIGHT }} />
                            <span className="car-supplier-name">{car.supplier.fullName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                        <span className="booking-detail-title">{strings.COST}</span>
                        <div className="booking-detail-value booking-price">{bookcarsHelper.formatPrice(price, commonStrings.CURRENCY, language)}</div>
                      </div>
                    </div>
                  </div>
                  { /*
                  {!authenticated && (
                    <div className="driver-details">
                      <div className="booking-info">
                        <DriverIcon />
                        <span>{strings.DRIVER_DETAILS}</span>
                      </div>
                      <div className="driver-details-form">
                        <FormControl fullWidth margin="dense">
                          <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                          <OutlinedInput type="text" label={commonStrings.FULL_NAME} required onChange={handleFullNameChange} autoComplete="off" />
                        </FormControl>
                        <FormControl fullWidth margin="dense">
                          <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                          <OutlinedInput
                            type="text"
                            label={commonStrings.EMAIL}
                            error={!emailValid || emailRegitered}
                            onBlur={handleEmailBlur}
                            onChange={handleEmailChange}
                            required
                            autoComplete="off"
                          />
                          <FormHelperText error={!emailValid || emailRegitered}>
                            {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                            {(emailRegitered && (
                              <span>
                                <span>{commonStrings.EMAIL_ALREADY_REGISTERED}</span>
                                <span> </span>
                                <a href={`/sign-in?c=${car._id}&p=${pickupLocation._id}&d=${dropOffLocation._id}&f=${from.getTime()}&t=${to.getTime()}&from=checkout`}>{strings.SIGN_IN}</a>
                              </span>
                            ))
                              || ''}
                            {(emailInfo && strings.EMAIL_INFO) || ''}
                          </FormHelperText>
                        </FormControl>
                        <FormControl fullWidth margin="dense">
                          <InputLabel className="required">{commonStrings.PHONE}</InputLabel>
                          <OutlinedInput type="text" label={commonStrings.PHONE} error={!phoneValid} onBlur={handlePhoneBlur} onChange={handlePhoneChange} required autoComplete="off" />
                          <FormHelperText error={!phoneValid}>
                            {(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}
                            {(phoneInfo && strings.PHONE_INFO) || ''}
                          </FormHelperText>
                        </FormControl>
                        <FormControl fullWidth margin="dense">
                          <DatePicker
                            label={commonStrings.BIRTH_DATE}
                            variant="outlined"
                            required
                            onChange={(_birthDate) => {
                              if (_birthDate) {
                                const _birthDateValid = validateBirthDate(_birthDate)

                                setBirthDate(_birthDate)
                                setBirthDateValid(_birthDateValid)
                              }
                            }}
                            language={language}
                          />
                          <FormHelperText error={!birthDateValid}>{(!birthDateValid && helper.getBirthDateError(car.minimumAge)) || ''}</FormHelperText>
                        </FormControl>

                        {env.RECAPTCHA_ENABLED && (
                          <div className="recaptcha">
                            <GoogleReCaptcha onVerify={handleRecaptchaVerify} />
                          </div>
                        )}

                        <div className="booking-tos">
                          <table>
                            <tbody>
                              <tr>
                                <td aria-label="tos">
                                  <Checkbox checked={tosChecked} onChange={handleTosChange} color="primary" />
                                </td>
                                <td>
                                  <Link href="/tos" target="_blank" rel="noreferrer">
                                    {commonStrings.TOS}
                                  </Link>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <SocialLogin />
                      </div>
                    </div>
                  )}
                    */}
                  {(adManuallyChecked && additionalDriver) && (
                    <div className="driver-details">
                      <div className="booking-info">
                        <DriverIcon />
                        <span>{csStrings.ADDITIONAL_DRIVER}</span>
                      </div>
                      <div className="driver-details-form">
                        <FormControl fullWidth margin="dense">
                          <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                          <OutlinedInput
                            type="text"
                            label={commonStrings.FULL_NAME}
                            required={adRequired}
                            onChange={(e) => {
                              setAddiontalDriverFullName(e.target.value)
                            }}
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormControl fullWidth margin="dense">
                          <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                          <OutlinedInput
                            type="text"
                            label={commonStrings.EMAIL}
                            error={!addiontalDriverEmailValid}
                            onBlur={(e) => {
                              _validateEmail(e.target.value)
                            }}
                            onChange={(e) => {
                              setAddiontalDriverEmail(e.target.value)

                              if (!e.target.value) {
                                setAddiontalDriverEmailValid(true)
                              }
                            }}
                            required={adRequired}
                            autoComplete="off"
                          />
                          <FormHelperText error={!addiontalDriverEmailValid}>{(!addiontalDriverEmailValid && commonStrings.EMAIL_NOT_VALID) || ''}</FormHelperText>
                        </FormControl>
                        <FormControl fullWidth margin="dense">
                          <InputLabel className="required">{commonStrings.PHONE}</InputLabel>
                          <OutlinedInput
                            type="text"
                            label={commonStrings.PHONE}
                            error={!addiontalDriverPhoneValid}
                            onBlur={(e) => {
                              _validatePhone(e.target.value)
                            }}
                            onChange={(e) => {
                              setAddiontalDriverPhone(e.target.value)

                              if (!e.target.value) {
                                setAddiontalDriverPhoneValid(true)
                              }
                            }}
                            required={adRequired}
                            autoComplete="off"
                          />
                          <FormHelperText error={!addiontalDriverPhoneValid}>{(!addiontalDriverPhoneValid && commonStrings.PHONE_NOT_VALID) || ''}</FormHelperText>
                        </FormControl>
                        <FormControl fullWidth margin="dense">
                          <DatePicker
                            label={commonStrings.BIRTH_DATE}
                            variant="outlined"
                            required={adRequired}
                            onChange={(_birthDate) => {
                              if (_birthDate) {
                                const _birthDateValid = _validateBirthDate(_birthDate)

                                setAddiontalDriverBirthDate(_birthDate)
                                setAddiontalDriverBirthDateValid(_birthDateValid)
                              }
                            }}
                            language={language}
                          />
                          <FormHelperText error={!addiontalDriverBirthDateValid}>{(!addiontalDriverBirthDateValid && helper.getBirthDateError(car.minimumAge)) || ''}</FormHelperText>
                        </FormControl>
                      </div>
                    </div>
                  )}

                  {car.supplier.payLater && (
                    <div className="payment-options-container">
                      <div className="booking-info">
                        <PaymentOptionsIcon />
                        <span>{strings.PAYMENT_OPTIONS}</span>
                      </div>
                      <div className="payment-options">
                        <FormControl>
                          <RadioGroup
                            defaultValue="payLater"
                            onChange={(event) => {
                              setPayLater(event.target.value === 'payLater')
                            }}
                          >
                            <FormControlLabel
                              value="payLater"
                              control={<Radio />}
                              label={(
                                <span className="payment-button">
                                  <span>{strings.PAY_LATER}</span>
                                  <span className="payment-info">{`(${strings.PAY_LATER_INFO})`}</span>
                                </span>
                              )}
                            />
                            { /* <FormControlLabel
                              value="payOnline"
                              control={<Radio />}
                              label={(
                                <span className="payment-button">
                                  <span>{strings.PAY_ONLINE}</span>
                                  <span className="payment-info">{`(${strings.PAY_ONLINE_INFO})`}</span>
                                </span>
                              )}
                            /> */ }
                          </RadioGroup>
                        </FormControl>
                      </div>
                    </div>
                  )}

                  {(!car.supplier.payLater || !payLater) && (
                    clientSecret && (
                      <div className="payment-options-container">
                        <EmbeddedCheckoutProvider
                          stripe={stripePromise}
                          options={{ clientSecret }}
                        >
                          <EmbeddedCheckout />
                        </EmbeddedCheckoutProvider>
                      </div>
                    )
                  )}
                  <div className="booking-buttons">
                    {((!clientSecret || payLater) && (user && user?.phone)) && (
                      <Button type="submit" variant="contained" className="btn-checkout btn-margin-bottom" size="small" disabled={loading}>
                        {
                          loading
                            ? <CircularProgress color="inherit" size={24} />
                            : strings.BOOK
                        }
                      </Button>
                    )}
                    {((!clientSecret || (payLater)) && user && !user?.phone) && (
                    <Button href="/settings" variant="contained" className="btn-checkout btn-margin-bottom" size="small" disabled={loading}>
                      {
                          loading
                            ? <CircularProgress color="inherit" size={24} />
                            : 'Compléter votre profil pour réserver'
                        }
                    </Button>
                    )}
                    {((!clientSecret || (payLater)) && !user) && (
                    <Button href="/sign-in" variant="contained" className="btn-checkout btn-margin-bottom" size="small" disabled={loading}>
                      {
                          loading
                            ? <CircularProgress color="inherit" size={24} />
                            : strings.SIGN_IN2
                        }
                    </Button>
                    )}
                    <Button
                      variant="contained"
                      className="btn-cancel btn-margin-bottom"
                      size="small"
                      onClick={async () => {
                        try {
                          if (bookingId && sessionId) {
                            await BookingService.deleteTempBooking(bookingId, sessionId)
                          }
                        } catch (err) {
                          helper.error(err)
                        } finally {
                          navigate('/')
                        }
                      }}
                    >
                      {commonStrings.CANCEL}
                    </Button>
                  </div>
                </div>
                <div className="form-error">
                  {paymentFailed && <Error message={strings.PAYMENT_FAILED} />}
                </div>
              </form>
            </Paper>
          </div>
        )}
        {noMatch && <NoMatch hideHeader />}
        {success && <Info message={payLater ? strings.PAY_LATER_SUCCESS : strings.SUCCESS} type="success" />}

        <Dialog
          open={openConfirmationDialog}
          onClose={handleCloseConfirmationDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {strings.CONFIRM_RESERVATION_TITLE}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {strings.CONFIRM_RESERVATION_MESSAGE}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmationDialog} color="primary">
              {commonStrings.CANCEL}
            </Button>
            <Button onClick={handleConfirmReservation} color="primary" autoFocus disabled={loading}>
              {commonStrings.CONFIRM}
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </ReCaptchaProvider>
  )
}

export default Checkout
