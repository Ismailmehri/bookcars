import React, { useState } from 'react'
import {
  Input,
  InputLabel,
  FormControl,
  Button,
  Paper,
  FormControlLabel,
  Switch,
  TextField,
  FormHelperText,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Slider,
  Box,
} from '@mui/material'
import { Delete as DeleteIcon, Edit as EditIcon, Info as InfoIcon } from '@mui/icons-material'
import DateTimePicker from '@/components/DateTimePicker'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings as csStrings } from '@/lang/cars'
import { strings } from '@/lang/create-car'
import * as CarService from '@/services/CarService'
import * as helper from '@/common/helper'
import * as UserService from '@/services/UserService'
import Error from './Error'
import ErrorMessage from '@/components/Error'
import Backdrop from '@/components/SimpleBackdrop'
import NoMatch from './NoMatch'
import Avatar from '@/components/Avatar'
import SupplierSelectList from '@/components/SupplierSelectList'
import LocationSelectList from '@/components/LocationSelectList'
import CarTypeList from '@/components/CarTypeList'
import GearboxList from '@/components/GearboxList'
import SeatsList from '@/components/SeatsList'
import DoorsList from '@/components/DoorsList'
import FuelPolicyList from '@/components/FuelPolicyList'
import MultimediaList from '@/components/MultimediaList'
import CarRangeList from '@/components/CarRangeList'
import { Discount } from ':bookcars-types'
import '@/assets/css/create-car.css'

interface PricePeriod {
  startDate: null | Date
  endDate: null | Date
  dailyPrice: null | number
  reason?: string
}

interface UnavailablePeriod {
  startDate: Date | null;
  endDate: Date | null;
}

const marks = [
  {
    value: 0,
    label: '0 an',
  },
  {
    value: 1,
    label: '1 an',
  },
  {
    value: 2,
    label: '2 ans',
  },
  {
    value: 3,
    label: '3 ans',
  },
  {
    value: 4,
    label: '4 ans',
  },
  {
    value: 5,
    label: '5 ans',
  }
]

const marksDays = [
  {
    value: 1,
    label: '1 jour',
  },
  {
    value: 2,
    label: '2 jours',
  },
  {
    value: 3,
    label: '3 jours',
  },
  {
    value: 4,
    label: '4 jours',
    disabled: true
  },
  {
    value: 5,
    label: '5 jours',
    disabled: true
  },
  {
    value: 6,
    label: '6 jours',
  },
  {
    value: 7,
    label: '7 jours',
  }
]

const UpdateCar = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [car, setCar] = useState<bookcarsTypes.Car>()
  const [noMatch, setNoMatch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState(false)
  const [imageRequired, setImageRequired] = useState(false)
  const [imageSizeError, setImageSizeError] = useState(false)
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [supplier, setSupplier] = useState<bookcarsTypes.Option>()
  const [locations, setLocations] = useState<bookcarsTypes.Option[]>([])
  const [range, setRange] = useState('')
  const [multimedia, setMultimedia] = useState<bookcarsTypes.CarMultimedia[]>([])
  const [rating, setRating] = useState('')
  const [co2, setCo2] = useState('')
  const [minimumDrivingLicenseYears, setMinimumDrivingLicenseYears] = useState<number>(3)
  const [available, setAvailable] = useState(false)
  const [type, setType] = useState('')
  const [gearbox, setGearbox] = useState('')
  const [dailyPrice, setDailyPrice] = useState('')
  const [discountedDailyPrice, setDiscountedDailyPrice] = useState('')
  const [biWeeklyPrice, setBiWeeklyPrice] = useState('')
  const [discountedBiWeeklyPrice, setDiscountedBiWeeklyPrice] = useState('')
  const [weeklyPrice, setWeeklyPrice] = useState('')
  const [discountedWeeklyPrice, setDiscountedWeeklyPrice] = useState('')
  const [monthlyPrice, setMonthlyPrice] = useState('')
  const [discountedMonthlyPrice, setDiscountedMonthlyPrice] = useState('')
  const [seats, setSeats] = useState('')
  const [doors, setDoors] = useState('')
  const [aircon, setAircon] = useState(false)
  const [mileage, setMileage] = useState('')
  const [fuelPolicy, setFuelPolicy] = useState('')
  const [cancellation, setCancellation] = useState('')
  const [amendments, setAmendments] = useState('')
  const [theftProtection, setTheftProtection] = useState('')
  const [collisionDamageWaiver, setCollisionDamageWaiver] = useState('')
  const [fullInsurance, setFullInsurance] = useState('')
  const [additionalDriver, setAdditionalDriver] = useState('')
  const [minimumAge, setMinimumAge] = useState(String(env.MINIMUM_AGE))
  const [minimumAgeValid, setMinimumAgeValid] = useState(true)
  const [formError, setFormError] = useState(false)
  const [periodPriceError, setPeriodPriceError] = useState(false)
  const [periodUnvalableError, setPeriodUnvalableError] = useState(false)
  const [deposit, setDeposit] = useState('')
  const [pricePeriods, setPricePeriods] = useState<PricePeriod[]>([])
  const [unavailablePeriods, setUnavailablePeriods] = useState<UnavailablePeriod[]>([])
  const [minimumRentalDays, setMinimumRentalDays] = useState<number>(1)
  const [days, setDays] = useState<string>('') // Utiliser "" au lieu de undefined
  const [discountPercentage, setDiscountPercentage] = useState<string>('')
  const [daysValid, setDaysValid] = useState<boolean>(true)
  const [discountPercentageValid, setDiscountPercentageValid] = useState<boolean>(true)
  const [newUnavailablePeriod, setNewUnavailablePeriod] = useState<UnavailablePeriod>({
    startDate: null,
    endDate: null,
  })

  const [newPeriod, setNewPeriod] = useState<PricePeriod>({
    startDate: null,
    endDate: null,
    dailyPrice: null,
    reason: '',
  })

  const handleAddUnavailablePeriod = () => {
    if (newUnavailablePeriod.startDate && newUnavailablePeriod.endDate) {
      setUnavailablePeriods([...unavailablePeriods, newUnavailablePeriod])
      setNewUnavailablePeriod({ startDate: null, endDate: null })
      setPeriodUnvalableError(false)
    }
  }

  const handleDeleteUnavailablePeriod = (index: number) => {
    const updatedPeriods = unavailablePeriods.filter((_, i) => i !== index)
    setUnavailablePeriods(updatedPeriods)
    setPeriodUnvalableError(false)
  }

  const handleEditUnavailablePeriod = (index: number) => {
    const periodToEdit = unavailablePeriods[index]
    setNewUnavailablePeriod({
      startDate: periodToEdit.startDate,
      endDate: periodToEdit.endDate,
    })
    handleDeleteUnavailablePeriod(index)
    setPeriodUnvalableError(false)
  }
  const handleAddPeriod = () => {
    if (newPeriod.startDate && newPeriod.endDate && newPeriod.dailyPrice) {
      const start = new Date(newPeriod.startDate)
      const end = new Date(newPeriod.endDate)
      if (start <= end) {
        setPricePeriods([...pricePeriods, { ...newPeriod, startDate: start, endDate: end }])
        setNewPeriod({ startDate: null, endDate: null, dailyPrice: null, reason: '' })
      }
    }
    setPeriodPriceError(false)
  }

  const handleDeletePeriod = (index: number) => {
    const updatedPeriods = pricePeriods.filter((_, i) => i !== index)
    setPricePeriods(updatedPeriods)
    setPeriodPriceError(false)
  }

  const handleEditPeriod = (index: number) => {
    const periodToEdit = pricePeriods[index]
    setNewPeriod({
      startDate: periodToEdit.startDate,
      endDate: periodToEdit.endDate,
      dailyPrice: periodToEdit.dailyPrice,
      reason: periodToEdit.reason || '',
    })
    handleDeletePeriod(index)
    setPeriodPriceError(false)
  }

  const handleApplyDefaultPeriods = () => {
    const base = Number(dailyPrice)
    if (Number.isNaN(base)) {
      setPricePeriods([])
      return
    }

    const year = new Date().getFullYear()
    const defaults: PricePeriod[] = [
      {
        startDate: new Date(year, 0, 2),
        endDate: new Date(year, 2, 15),
        dailyPrice: base,
      },
      {
        startDate: new Date(year, 2, 16),
        endDate: new Date(year, 2, 25),
        dailyPrice: base + 50,
        reason: strings.EID_AL_FITR,
      },
      {
        startDate: new Date(year, 2, 26),
        endDate: new Date(year, 4, 20),
        dailyPrice: base,
      },
      {
        startDate: new Date(year, 4, 21),
        endDate: new Date(year, 4, 31),
        dailyPrice: base + 50,
        reason: strings.EID_AL_ADHA,
      },
      {
        startDate: new Date(year, 5, 1),
        endDate: new Date(year, 5, 30),
        dailyPrice: base + 50,
        reason: strings.SUMMER,
      },
      {
        startDate: new Date(year, 6, 1),
        endDate: new Date(year, 7, 31),
        dailyPrice: base + 80,
        reason: strings.SUMMER,
      },
      {
        startDate: new Date(year, 8, 1),
        endDate: new Date(year, 8, 30),
        dailyPrice: base + 50,
        reason: strings.SUMMER,
      },
      {
        startDate: new Date(year, 9, 1),
        endDate: new Date(year, 11, 15),
        dailyPrice: base,
      },
      {
        startDate: new Date(year, 11, 15),
        endDate: new Date(year + 1, 0, 1),
        dailyPrice: base + 50,
        reason: strings.YEAR_END,
      },
    ]

    setPricePeriods(defaults)
    setPeriodPriceError(false)
  }

  const handleBeforeUpload = () => {
    setLoading(true)
  }

  const handleImageChange = (_image: string) => {
    setLoading(false)
    setImage(_image as string)

    if (_image !== null) {
      setImageRequired(false)
    }
  }

  const handleImageValidate = (valid: boolean) => {
    if (!valid) {
      setImageSizeError(true)
      setImageRequired(false)
      setError(false)
      setLoading(false)
    } else {
      setImageSizeError(false)
      setImageRequired(false)
      setError(false)
    }
  }
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleSupplierChange = (values: bookcarsTypes.Option[]) => {
    setSupplier(values.length > 0 ? values[0] : undefined)
  }

  const validateMinimumAge = (age: string, updateState = true) => {
    if (age) {
      const _age = Number.parseInt(age, 10)
      const _minimumAgeValid = _age >= env.MINIMUM_AGE && _age <= 99
      if (updateState) {
        setMinimumAgeValid(_minimumAgeValid)
      }
      if (_minimumAgeValid) {
        setFormError(false)
      }
      return _minimumAgeValid
    }
    setMinimumAgeValid(true)
    setFormError(false)
    return true
  }

  const handleMinimumAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinimumAge(e.target.value)

    const _minimumAgeValid = validateMinimumAge(e.target.value, false)
    if (_minimumAgeValid) {
      setMinimumAgeValid(true)
      setFormError(false)
    }
  }

  const handleMinimumDrivingLicenseYears = (_event: Event, value: number | number[]) => {
    if (typeof value === 'number') {
      setMinimumDrivingLicenseYears(value)
    }
  }

  const handleLocationsChange = (_locations: bookcarsTypes.Option[]) => {
    setLocations(_locations)
  }

  const handleCarRangeChange = (value: string) => {
    setRange(value)
  }

  const handleMultimediaChange = (value: bookcarsTypes.CarMultimedia[]) => {
    setMultimedia(value)
  }

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRating(e.target.value)
  }

  const handleCo2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCo2(e.target.value)
  }

  const handleAvailableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvailable(e.target.checked)
  }

  const handleCarTypeChange = (value: string) => {
    setType(value)
  }

  const handleGearboxChange = (value: string) => {
    setGearbox(value)
  }

  const handleAirconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAircon(e.target.checked)
  }

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeposit(e.target.value)
  }

  const handleSeatsChange = (value: string) => {
    setSeats(value)
  }

  const handleDoorsChange = (value: string) => {
    setDoors(value)
  }

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMileage(e.target.value)
  }

  const handleFuelPolicyChange = (value: string) => {
    setFuelPolicy(value)
  }

  const handleCancellationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCancellation(e.target.value)
  }

  const handleAmendmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmendments(e.target.value)
  }

  const extraToString = (extra: number) => (extra === -1 ? '' : String(extra))

  const extraToNumber = (extra: string) => (extra === '' ? -1 : Number(extra))

  const getPrice = (price: string) => (price && Number(price)) || null

  const getPriceAsString = (price?: number | null) => (price && price.toString()) || ''

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      if (newPeriod.startDate && newPeriod.endDate && newPeriod.dailyPrice) {
        setPeriodPriceError(true)
        return
      }

      if (newUnavailablePeriod.startDate && newUnavailablePeriod.endDate) {
        setPeriodUnvalableError(true)
        return
      }

      const _minimumAgeValid = validateMinimumAge(minimumAge)
      if (!_minimumAgeValid) {
        setFormError(true)
        return
      }

      if (!car || !supplier) {
        helper.error()
        return
      }

// Vérification des champs discount : si l'un est renseigné, l'autre doit l'être aussi
if ((days && !discountPercentage) || (!days && discountPercentage)) {
  setFormError(true)
  // setErrorMessage('Si vous remplissez un champ, l\'autre doit également être renseigné.')
  return
}

// Validation de la plage des jours et du pourcentage
const dayValue = days ? parseInt(days, 10) : null
const discountValue = discountPercentage ? parseInt(discountPercentage, 10) : null

if (dayValue && (dayValue < 3 || dayValue > 30)) {
  setFormError(true)
  // setErrorMessage('Le nombre de jours doit être compris entre 3 et 30.')
  return
}

if (discountValue && (discountValue < 0 || discountValue >= 50)) {
  setFormError(true)
  // setErrorMessage('Le pourcentage de remise doit être inférieur à 50%.')
  return
}

// Créer l'objet Discount si les deux champs sont remplis
const discount: Discount | undefined = dayValue && discountValue ? {
  threshold: dayValue,
  percentage: discountValue,
} : undefined

      const data: bookcarsTypes.UpdateCarPayload = {
        _id: car._id,
        name,
        supplier: supplier._id,
        minimumAge: Number.parseInt(minimumAge, 10),
        locations: locations.map((l) => l._id),
        dailyPrice: Number(dailyPrice),
        discountedDailyPrice: getPrice(discountedDailyPrice),
        biWeeklyPrice: getPrice(biWeeklyPrice),
        discountedBiWeeklyPrice: getPrice(discountedBiWeeklyPrice),
        weeklyPrice: getPrice(weeklyPrice),
        discountedWeeklyPrice: getPrice(discountedWeeklyPrice),
        monthlyPrice: getPrice(monthlyPrice),
        discountedMonthlyPrice: getPrice(discountedMonthlyPrice),
        periodicPrices: pricePeriods,
        deposit: Number(deposit),
        available,
        type,
        gearbox,
        aircon,
        image,
        seats: Number.parseInt(seats, 10),
        doors: Number.parseInt(doors, 10),
        fuelPolicy,
        mileage: extraToNumber(mileage),
        cancellation: extraToNumber(cancellation),
        amendments: extraToNumber(amendments),
        theftProtection: extraToNumber(theftProtection),
        collisionDamageWaiver: extraToNumber(collisionDamageWaiver),
        fullInsurance: extraToNumber(fullInsurance),
        additionalDriver: extraToNumber(additionalDriver),
        range,
        multimedia,
        rating: Number(rating) || undefined,
        co2: Number(co2) || undefined,
        minimumDrivingLicenseYears,
        unavailablePeriods,
        minimumRentalDays,
        discounts: discount, // Ajouter le discount au payload
      }

      const status = await CarService.update(data)

      if (status === 200) {
        helper.info(commonStrings.UPDATED)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    if (_user && _user.verified) {
      setLoading(true)
      setUser(_user)
      const params = new URLSearchParams(window.location.search)
      if (params.has('cr')) {
        const id = params.get('cr')
        if (id && id !== '') {
          try {
            const _car = await CarService.getCar(id)

            if (_car) {
              if (_user.type === bookcarsTypes.RecordType.Supplier && _user._id !== _car.supplier._id) {
                setLoading(false)
                setNoMatch(true)
                return
              }

              const _supplier = {
                _id: _car.supplier._id as string,
                name: _car.supplier.fullName,
                image: _car.supplier.avatar,
              }

              setCar(_car)
              setImageRequired(!_car.image)
              setName(_car.name)
              setSupplier(_supplier)
              setMinimumAge(_car.minimumAge.toString())
              const lcs: bookcarsTypes.Option[] = []
              for (const loc of _car.locations) {
                const { _id, name: _name } = loc
                const lc: bookcarsTypes.Option = { _id, name: _name ?? '' }
                lcs.push(lc)
              }
              setLocations(lcs)
              setDailyPrice(getPriceAsString(_car.dailyPrice))
              setDiscountedDailyPrice(getPriceAsString(_car.discountedDailyPrice))
              setBiWeeklyPrice(getPriceAsString(_car.biWeeklyPrice))
              setDiscountedBiWeeklyPrice(getPriceAsString(_car.discountedBiWeeklyPrice))
              setWeeklyPrice(getPriceAsString(_car.weeklyPrice))
              setDiscountedWeeklyPrice(getPriceAsString(_car.discountedWeeklyPrice))
              setMonthlyPrice(getPriceAsString(_car.monthlyPrice))
              setDiscountedMonthlyPrice(getPriceAsString(_car.discountedMonthlyPrice))
              setPricePeriods(
                _car.periodicPrices
                  ? _car.periodicPrices.map((period) => ({
                      ...period,
                      startDate: period.startDate ? new Date(period.startDate) : null,
                      endDate: period.endDate ? new Date(period.endDate) : null,
                    }))
                  : []
              )
              setUnavailablePeriods(
                _car.unavailablePeriods
                  ? _car.unavailablePeriods.map((period) => ({
                      ...period,
                      startDate: period.startDate ? new Date(period.startDate) : null,
                      endDate: period.endDate ? new Date(period.endDate) : null,
                    }))
                  : []
              )
              setDeposit(_car.deposit.toString())
              setRange(_car.range)
              setMultimedia(_car?.multimedia || [])
              if (_car.rating) {
                setRating(_car.rating.toString())
              }
              if (_car.co2) {
                setCo2(_car.co2.toString())
              }
              if (_car.minimumDrivingLicenseYears !== undefined) {
                setMinimumDrivingLicenseYears(_car.minimumDrivingLicenseYears)
              }
              setAvailable(_car.available)
              setType(_car.type)
              setGearbox(_car.gearbox)
              setAircon(_car.aircon)
              setSeats(_car.seats.toString())
              setDoors(_car.doors.toString())
              setFuelPolicy(_car.fuelPolicy)
              setMileage(extraToString(_car.mileage))
              setCancellation(extraToString(_car.cancellation))
              setAmendments(extraToString(_car.amendments))
              setTheftProtection(extraToString(_car.theftProtection))
              setCollisionDamageWaiver(extraToString(_car.collisionDamageWaiver))
              setFullInsurance(extraToString(_car.fullInsurance))
              setAdditionalDriver(extraToString(_car.additionalDriver))
              if (_car.minimumRentalDays !== undefined) {
                setMinimumRentalDays(_car.minimumRentalDays)
              }
              if (_car.discounts && _car.discounts.threshold && _car.discounts.percentage) {
                setDays(extraToString(_car.discounts.threshold))
                setDiscountPercentage(extraToString(_car.discounts.percentage))
              }
              setVisible(true)
              setLoading(false)
            } else {
              setLoading(false)
              setNoMatch(true)
            }
          } catch (err) {
            helper.error(err)
            setLoading(false)
            setError(true)
            setVisible(false)
          }
        } else {
          setLoading(false)
          setNoMatch(true)
        }
      } else {
        setLoading(false)
        setNoMatch(true)
      }
    }
  }

  const admin = user && user.type === bookcarsTypes.RecordType.Admin
  const handleMinimumRentalDaysChange = (_event: Event, value: number | number[]) => {
    if (typeof value === 'number') {
      setMinimumRentalDays(value)
      console.log(_event)
    }
  }

  const handleDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setDays(value)

    const parsedValue = parseInt(value, 10)
    setDaysValid(parsedValue >= 3 && parsedValue <= 30)
  }

  const handleDiscountPercentageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setDiscountPercentage(value)

    const parsedValue = parseInt(value, 10)
    setDiscountPercentageValid(parsedValue >= 0 && parsedValue < 50)
  }
  return (
    <Layout onLoad={onLoad} strict>
      {!error && !noMatch && (
        <div className="create-car">
          <Paper className="car-form car-form-wrapper" elevation={10} style={visible ? {} : { display: 'none' }}>
            <form onSubmit={handleSubmit}>
              <Avatar
                type={bookcarsTypes.RecordType.Car}
                mode="update"
                record={car}
                hideDelete
                size="large"
                readonly={false}
                onBeforeUpload={handleBeforeUpload}
                onChange={handleImageChange}
                onValidate={handleImageValidate}
                color="disabled"
                className="avatar-ctn"
              />

              <div className="info">
                <InfoIcon />
                <span>{strings.RECOMMENDED_IMAGE_SIZE}</span>
              </div>

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{strings.NAME}</InputLabel>
                <Input type="text" required value={name} autoComplete="off" onChange={handleNameChange} />
              </FormControl>

              {admin && (
                <FormControl fullWidth margin="dense">
                  <SupplierSelectList
                    label={strings.SUPPLIER}
                    required
                    value={supplier}
                    variant="standard"
                    onChange={handleSupplierChange}
                  />
                </FormControl>
              )}

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{strings.MINIMUM_AGE}</InputLabel>
                <Input
                  type="text"
                  required
                  error={!minimumAgeValid}
                  value={minimumAge}
                  autoComplete="off"
                  onChange={handleMinimumAgeChange}
                  inputProps={{ inputMode: 'numeric', pattern: '^\\d{2}$' }}
                />
                <FormHelperText error={!minimumAgeValid}>{(!minimumAgeValid && strings.MINIMUM_AGE_NOT_VALID) || ''}</FormHelperText>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel className="required" shrink>
                  {strings.DRVER_LICENSE_MINIMUM_AGE}
                </InputLabel>
                <Box
                  sx={{
                    borderRadius: '4px', // Coins arrondis
                    padding: '16px', // Espacement interne
                    marginTop: '8px', // Ajustement pour l'espace avec le label
                  }}
                >
                  <Slider
                    aria-label="Minimum Driving License Years"
                    defaultValue={minimumDrivingLicenseYears}
                    value={minimumDrivingLicenseYears}
                    onChange={handleMinimumDrivingLicenseYears}
                    valueLabelDisplay="auto"
                    shiftStep={1}
                    step={1}
                    marks={marks}
                    min={0}
                    max={5}
                  />
                </Box>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel className="required" shrink>
                  {strings.MINIMUM_RENTAL_DAYS}
                </InputLabel>
                <Box
                  sx={{
                    borderRadius: '4px', // Coins arrondis
                    padding: '16px', // Espacement interne
                    marginTop: '8px', // Ajustement pour l'espace avec le label
                  }}
                >
                  <Slider
                    aria-label="Minimum Driving License Years"
                    defaultValue={1}
                    value={minimumRentalDays}
                    onChange={handleMinimumRentalDaysChange}
                    valueLabelDisplay="auto"
                    shiftStep={1}
                    step={1}
                    marks={marksDays}
                    min={1}
                    max={7}
                  />
                </Box>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <LocationSelectList label={strings.LOCATIONS} multiple required variant="standard" value={locations} onChange={handleLocationsChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${strings.DAILY_PRICE} (${commonStrings.CURRENCY})`}
                  slotProps={{
                    htmlInput: {
                      inputMode: 'numeric',
                      pattern: '^\\d+(.\\d+)?$'
                    }
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setDailyPrice(e.target.value)
                  }}
                  required
                  variant="standard"
                  autoComplete="off"
                  value={dailyPrice}
                />
              </FormControl>

              <div className="add-border">
                <span className="text-title">
                  Ajouter une remise pour les longues durées
                  <Chip
                    label="Optionnel"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                        height: 'auto',
                        margin: '0 0px 4px 10px',
                        '& .MuiChip-label': {
                          display: 'block',
                          whiteSpace: 'normal',
                          paddingBottom: '3px'
                        },
                      }}
                  />
                  <br />
                  <small>
                    Offrez une réduction aux clients qui réservent pour une période prolongée.
                    Par exemple, appliquez
                    {' '}
                    <strong>5% de remise</strong>
                    {' '}
                    pour toute réservation de
                    {' '}
                    <strong>14 jours ou plus</strong>
                    .
                  </small>
                </span>

                <Box
                  component="form"
                  sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mt: 2,
                      p: 2,
                      border: '1px solid #ccc',
                      borderRadius: '8px'
                    }}
                  noValidate
                  autoComplete="off"
                >
                  <TextField
                    id="min-days"
                    label="Nombre de jours minimum"
                    type="number"
                    value={days}
                    onChange={handleDaysChange}
                    error={!daysValid}
                    helperText={!daysValid ? 'Doit être entre 3 et 30 jours.' : `À partir de ${days || 0} jours, une remise est appliquée.`}
                    slotProps={{
                    inputLabel: { shrink: true },
                  }}
                    sx={{ flex: 1 }}
                  />

                  <TextField
                    id="discount-percentage"
                    label="Pourcentage de remise"
                    type="number"
                    value={discountPercentage}
                    onChange={handleDiscountPercentageChange}
                    error={!discountPercentageValid}
                    helperText={!discountPercentageValid ? 'Doit être inférieur à 50%.' : `Une remise de ${discountPercentage || 0}% de réduction sur les ${days || 0} jours.`}
                    slotProps={{
                    inputLabel: { shrink: true },
                  }}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </div>

              <div className="add-border">
                <span className="text-title">
                  Ajouter un tarif spécial pour des périodes spécifiques
                  <Chip
                    label="optionnel"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                    height: 'auto',
                    margin: '0 0px 4px 10px',
                    '& .MuiChip-label': {
                      display: 'block',
                      whiteSpace: 'normal',
                      paddingBottom: '3px'
                    },
                  }}
                  />
                  <br />
                  <small>
                    (par exemple, haute saison en juin, juillet, août, ou périodes festives comme fin décembre)
                  </small>
                </span>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  {/* DateTimePicker pour la date de début */}
                  <FormControl sx={{ width: '200px' }} margin="dense">
                    {' '}
                    {/* Largeur réduite */}
                    <DateTimePicker
                      label={strings.START_DATE}
                      value={newPeriod.startDate ? new Date(newPeriod.startDate) : undefined}
                      maxDate={newPeriod.endDate ? new Date(newPeriod.endDate) : undefined} // Limite la date max en fonction de la date de fin
                      onChange={(date) => setNewPeriod({ ...newPeriod, startDate: date })}
                      language={UserService.getLanguage()}
                      showTime={false}
                    />
                  </FormControl>

                  {/* DateTimePicker pour la date de fin */}
                  <FormControl sx={{ width: '200px' }} margin="dense">
                    {' '}
                    {/* Largeur réduite */}
                    <DateTimePicker
                      label={strings.END_DATE}
                      value={newPeriod.endDate ? new Date(newPeriod.endDate) : undefined}
                      minDate={newPeriod.startDate ? new Date(newPeriod.startDate) : undefined} // Limite la date min en fonction de la date de début
                      onChange={(date) => setNewPeriod({ ...newPeriod, endDate: date })}
                      language={UserService.getLanguage()}
                      showTime={false}
                    />
                  </FormControl>

                  {/* TextField pour le prix quotidien */}
                  <FormControl sx={{ width: '150px' }} margin="dense">
                    {' '}
                    {/* Largeur réduite */}
                    <TextField
                      label={`${strings.DAILY_PRICE} (${commonStrings.CURRENCY})`}
                      slotProps={{
                        htmlInput: {
                          inputMode: 'numeric',
                          pattern: '^\\d+(.\\d+)?$',
                        },
                      }}
                      value={newPeriod.dailyPrice !== null ? newPeriod.dailyPrice : ''}
                      variant="standard"
                      autoComplete="off"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewPeriod({ ...newPeriod, dailyPrice: Number(e.target.value) })}
                    />
                  </FormControl>

                  {/* Bouton pour ajouter la période */}
                  <div className="add-button">
                    <Button
                      size="medium"
                      onClick={handleAddPeriod}
                      disabled={!newPeriod.startDate || !newPeriod.endDate || !newPeriod.dailyPrice}
                    >
                      Ajouter
                    </Button>
                    <Button size="medium" onClick={handleApplyDefaultPeriods} sx={{ ml: 1 }}>
                      {strings.ADD_DEFAULT_PERIODS}
                    </Button>
                  </div>
                </div>
                {pricePeriods.length > 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{strings.START_DATE}</TableCell>
                        <TableCell>{strings.END_DATE}</TableCell>
                        <TableCell>{strings.REASON}</TableCell>
                        <TableCell>{`${strings.DAILY_PRICE} (${commonStrings.CURRENCY})`}</TableCell>
                        <TableCell>{strings.ACTIONS_BUTTON}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pricePeriods.map((period, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow key={index}>
                          <TableCell>{period.startDate ? period.startDate.toLocaleDateString() : ''}</TableCell>
                          <TableCell>{period.endDate ? period.endDate.toLocaleDateString() : ''}</TableCell>
                          <TableCell>{period.reason || ''}</TableCell>
                          <TableCell>{`${period.dailyPrice} (${commonStrings.CURRENCY})`}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleEditPeriod(index)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeletePeriod(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
              ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              </div>
              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.DEPOSIT} (${commonStrings.CURRENCY})`}
                  slotProps={{
                    htmlInput: {
                      inputMode: 'numeric',
                      pattern: '^\\d+(.\\d+)?$'
                    }
                  }}
                  onChange={handleDepositChange}
                  required
                  variant="standard"
                  autoComplete="off"
                  value={deposit}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <CarRangeList label={strings.CAR_RANGE} variant="standard" required value={range} onChange={handleCarRangeChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <MultimediaList label={strings.MULTIMEDIA} value={multimedia} onChange={handleMultimediaChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={strings.RATING}
                  slotProps={{
                    htmlInput: {
                      type: 'number',
                      min: 1,
                      max: 5,
                      step: 0.01,
                    }
                  }}
                  onChange={handleRatingChange}
                  variant="standard"
                  autoComplete="off"
                  value={rating}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={strings.CO2}
                  slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' } }}
                  onChange={handleCo2Change}
                  variant="standard"
                  autoComplete="off"
                  value={co2}
                />
              </FormControl>

              <FormControl fullWidth margin="dense" className="checkbox-fc">
                <FormControlLabel control={<Switch checked={available} onChange={handleAvailableChange} color="primary" />} label={strings.AVAILABLE} className="checkbox-fcl" />
              </FormControl>

              <div className="add-border">
                <span className="text-title">
                  Marquer la voiture comme indisponible pour une période spécifique
                  <Chip
                    label="optionnel"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                    height: 'auto',
                    margin: '0 0px 4px 10px',
                    '& .MuiChip-label': {
                      display: 'block',
                      whiteSpace: 'normal',
                      paddingBottom: '3px'
                    },
                  }}
                  />
                  <br />
                  <small>
                    (par exemple, si elle est louée en dehors de Plany, en maintenance, ou pour toute autre raison)
                  </small>
                </span>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <FormControl fullWidth margin="dense">
                    <DateTimePicker
                      label={strings.START_DATE}
                      value={newUnavailablePeriod.startDate ? new Date(newUnavailablePeriod.startDate) : undefined}
                      maxDate={newUnavailablePeriod.endDate ? new Date(newUnavailablePeriod.endDate) : undefined} // Limite la date max en fonction de la date de fin
                      onChange={(date) => setNewUnavailablePeriod({ ...newUnavailablePeriod, startDate: date })}
                      language={UserService.getLanguage()}
                      showTime={false}
                    />
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <DateTimePicker
                      label={strings.END_DATE}
                      value={newUnavailablePeriod.endDate ? new Date(newUnavailablePeriod.endDate) : undefined}
                      minDate={newUnavailablePeriod.startDate ? new Date(newUnavailablePeriod.startDate) : undefined} // Limite la date min en fonction de la date de début
                      onChange={(date) => setNewUnavailablePeriod({ ...newUnavailablePeriod, endDate: date })}
                      language={UserService.getLanguage()}
                      showTime={false}
                    />
                  </FormControl>
                  <div className="add-button" style={{ marginLeft: '15px' }}>
                    <Button
                      size="medium"
                      onClick={handleAddUnavailablePeriod}
                      disabled={!newUnavailablePeriod.startDate || !newUnavailablePeriod.endDate}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
                {unavailablePeriods.length > 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{strings.START_DATE}</TableCell>
                        <TableCell>{strings.END_DATE}</TableCell>
                        <TableCell>{strings.ACTIONS_BUTTON}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unavailablePeriods.map((period, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow key={index}>
                          <TableCell>{period.startDate ? period.startDate.toLocaleDateString() : ''}</TableCell>
                          <TableCell>{period.endDate ? period.endDate.toLocaleDateString() : ''}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleEditUnavailablePeriod(index)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteUnavailablePeriod(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                )}
              </div>

              <FormControl fullWidth margin="dense">
                <CarTypeList label={strings.CAR_TYPE} variant="standard" required value={type} onChange={handleCarTypeChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <GearboxList label={strings.GEARBOX} variant="standard" required value={gearbox} onChange={handleGearboxChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <SeatsList label={strings.SEATS} variant="standard" required value={seats} onChange={handleSeatsChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <DoorsList label={strings.DOORS} variant="standard" required value={doors} onChange={handleDoorsChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <FuelPolicyList label={csStrings.FUEL_POLICY} variant="standard" required value={fuelPolicy} onChange={handleFuelPolicyChange} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <div className="info">
                  <InfoIcon />
                  <span>{commonStrings.OPTIONAL}</span>
                </div>
              </FormControl>

              <FormControl fullWidth margin="dense" className="checkbox-fc">
                <FormControlLabel control={<Switch checked={aircon} onChange={handleAirconChange} color="primary" />} label={strings.AIRCON} className="checkbox-fcl" />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.MILEAGE} (${csStrings.MILEAGE_UNIT})`}
                  slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' } }}
                  onChange={handleMileageChange}
                  variant="standard"
                  autoComplete="off"
                  value={mileage}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.CANCELLATION} (${commonStrings.CURRENCY})`}
                  slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' } }}
                  onChange={handleCancellationChange}
                  variant="standard"
                  autoComplete="off"
                  value={cancellation}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.AMENDMENTS} (${commonStrings.CURRENCY})`}
                  slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' } }}
                  onChange={handleAmendmentsChange}
                  variant="standard"
                  autoComplete="off"
                  value={amendments}
                />
              </FormControl>
              {/*
              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.THEFT_PROTECTION} (${csStrings.CAR_CURRENCY})`}
                  slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' } }}
                  onChange={handleTheftProtectionChange}
                  variant="standard"
                  autoComplete="off"
                  value={theftProtection}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.COLLISION_DAMAGE_WAVER} (${csStrings.CAR_CURRENCY})`}
                  slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' } }}
                  onChange={handleCollisionDamageWaiverChange}
                  variant="standard"
                  autoComplete="off"
                  value={collisionDamageWaiver}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.FULL_INSURANCE} (${csStrings.CAR_CURRENCY})`}
                  slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' } }}
                  onChange={handleFullinsuranceChange}
                  variant="standard"
                  autoComplete="off"
                  value={fullInsurance}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <TextField
                  label={`${csStrings.ADDITIONAL_DRIVER} (${csStrings.CAR_CURRENCY})`}
                  slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '^\\d+(.\\d+)?$' } }}
                  onChange={handleAdditionalDriverChange}
                  variant="standard"
                  autoComplete="off"
                  value={additionalDriver}
                />
              </FormControl>
                */}
              <div className="buttons">
                <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                  {commonStrings.SAVE}
                </Button>
                <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" href="/cars">
                  {commonStrings.CANCEL}
                </Button>
              </div>

              <div className="form-error">
                {imageRequired && <ErrorMessage message={commonStrings.IMAGE_REQUIRED} />}
                {imageSizeError && <ErrorMessage message={strings.CAR_IMAGE_SIZE_ERROR} />}
                {formError && <ErrorMessage message={commonStrings.FORM_ERROR} />}
                {periodPriceError && <ErrorMessage message="Veuillez cliquer sur 'Ajouter' pour enregistrer la période avant de soumettre le formulaire." />}
                {periodUnvalableError && <ErrorMessage message="Veuillez cliquer sur 'Ajouter' pour enregistrer la période avant de soumettre le formulaire." />}
              </div>
            </form>
          </Paper>
        </div>
      )}
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
      {error && <Error />}
      {noMatch && <NoMatch hideHeader />}
    </Layout>
  )
}

export default UpdateCar
