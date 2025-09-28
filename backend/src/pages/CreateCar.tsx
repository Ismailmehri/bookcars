import React, { useMemo, useState } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  Slider,
  MenuItem,
  Alert,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import DateTimePicker from '@/components/DateTimePicker'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import Layout from '@/components/Layout'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings as csStrings } from '@/lang/cars'
import { strings } from '@/lang/create-car'
import * as CarService from '@/services/CarService'
import * as helper from '@/common/helper'
import * as UserService from '@/services/UserService'
import Error from '@/components/Error'
import Backdrop from '@/components/SimpleBackdrop'
import Avatar from '@/components/Avatar'
import SupplierSelectList from '@/components/SupplierSelectList'
import LocationSelectList from '@/components/LocationSelectList'
import CarTypeList from '@/components/CarTypeList'
import GearboxList from '@/components/GearboxList'
import SeatsList from '@/components/SeatsList'
import DoorsList from '@/components/DoorsList'
import FuelPolicyList from '@/components/FuelPolicyList'
import CarRangeList from '@/components/CarRangeList'
import MultimediaList from '@/components/MultimediaList'

import '@/assets/css/create-car.css'
import { Discount } from ':bookcars-types'

interface PricePeriod {
  startDate: null | Date;
  endDate: null | Date;
  dailyPrice: null | number;
  reason?: string;
}

interface UnavailablePeriod {
  startDate: Date | null;
  endDate: Date | null;
}

const marks = [
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
  },
  {
    value: 5,
    label: '5 jours',
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

const getLocale = (language: string) => {
  switch (language) {
    case 'fr':
      return 'fr-FR'
    case 'es':
      return 'es-ES'
    default:
      return 'en-US'
  }
}

const COMMISSION_EXAMPLE_PRICE = 70

const CreateCar = () => {
  const navigate = useNavigate()
  const [isSupplier, setIsSupplier] = useState(false)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageSizeError, setImageSizeError] = useState(false)
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [supplier, setSupplier] = useState('')
  const [locations, setLocations] = useState<bookcarsTypes.Option[]>([])
  const [range, setRange] = useState('')
  const [multimedia, setMultimedia] = useState<bookcarsTypes.CarMultimedia[]>([])
  const [rating, setRating] = useState('')
  const [co2, setCo2] = useState('')
  const [minimumDrivingLicenseYears, setMinimumDrivingLicenseYears] = useState(3)
  const [available, setAvailable] = useState(true)
  const [type, setType] = useState('')
  const [gearbox, setGearbox] = useState('')
  const [dailyPrice, setDailyPrice] = useState('')
  const [seats, setSeats] = useState('')
  const [doors, setDoors] = useState('')
  const [aircon, setAircon] = useState(false)
  const [mileage, setMileage] = useState('')
  const [fuelPolicy, setFuelPolicy] = useState('')
  const [cancellation, setCancellation] = useState('')
  const [amendments, setAmendments] = useState('')
  const [minimumAge, setMinimumAge] = useState(String(env.MINIMUM_AGE))
  const [minimumAgeValid, setMinimumAgeValid] = useState(true)
  const [formError, setFormError] = useState(false)
  const [deposit, setDeposit] = useState('')
  const [pricePeriods, setPricePeriods] = useState<PricePeriod[]>([])
  const [unavailablePeriods, setUnavailablePeriods] = useState<UnavailablePeriod[]>([])
  const [minimumRentalDays, setMinimumRentalDays] = useState<number>(1)
  const [days, setDays] = useState<string>('') // Utiliser "" au lieu de undefined
  const [discountPercentage, setDiscountPercentage] = useState<string>('')
  const [daysValid, setDaysValid] = useState<boolean>(true)
  const [discountPercentageValid, setDiscountPercentageValid] = useState<boolean>(true)
  const [autoDefaultsApplied, setAutoDefaultsApplied] = useState<boolean>(false)
  const [newPeriod, setNewPeriod] = useState<PricePeriod>({
    startDate: null,
    endDate: null,
    dailyPrice: null,
    reason: '',
  })
  const [newPeriodError, setNewPeriodError] = useState<string | null>(null)
  const [editingPeriodIndex, setEditingPeriodIndex] = useState<number | null>(null)
  const [editingPeriod, setEditingPeriod] = useState<PricePeriod | null>(null)
  const [editPeriodError, setEditPeriodError] = useState<string | null>(null)
  const [newUnavailablePeriod, setNewUnavailablePeriod] = useState<UnavailablePeriod>({
    startDate: null,
    endDate: null,
  })
  const [locationsError, setLocationsError] = useState<string | null>(null) // État pour l'erreur des localisations

  const language = UserService.getLanguage()
  const locale = getLocale(language)
  const isMobile = env.isMobile()

  const formatCommissionRate = (value: number) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value)

  const formatPriceWithCurrency = (value: number) => {
    const sanitizedValue = Number.isFinite(value) ? value : 0
    const roundedValue = Math.ceil(sanitizedValue)
    return bookcarsHelper.formatPrice(roundedValue, commonStrings.CURRENCY, language)
  }

  const formatDateForDisplay = (value: Date | null) => {
    if (!value) {
      return '—'
    }

    return new Intl.DateTimeFormat(locale).format(value)
  }

  const computeCommissionInfo = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) {
      return undefined
    }

    const numeric = typeof value === 'string' ? Number.parseFloat(value) : value

    if (numeric === null || numeric === undefined) {
      return undefined
    }

    if (Number.isNaN(numeric) || !Number.isFinite(numeric) || numeric <= 0) {
      return undefined
    }

    const commissionValue = Number(((numeric * env.COMMISSION_RATE) / 100).toFixed(2))
    const clientPrice = Number((numeric + commissionValue).toFixed(2))

    return {
      commissionValue,
      clientPrice,
    }
  }

  const commissionRateLabel = `${formatCommissionRate(env.COMMISSION_RATE)}%`
  const commissionEffectiveDateLabel = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(env.COMMISSION_EFFECTIVE_DATE)
  const commissionManagementPath = isSupplier ? '/agency-commissions' : '/admin-commissions'
  const exampleCommissionInfo = computeCommissionInfo(COMMISSION_EXAMPLE_PRICE)
  const exampleAgencyPriceLabel = formatPriceWithCurrency(COMMISSION_EXAMPLE_PRICE)
  const exampleCommissionAmountLabel = formatPriceWithCurrency(
    exampleCommissionInfo?.commissionValue ?? 0,
  )
  const exampleClientPriceLabel = formatPriceWithCurrency(exampleCommissionInfo?.clientPrice ?? 0)
  const commissionLinkSegments = strings.CLIENT_PRICE_INFO_LINK.split('{link}')

  const dailyCommissionInfo = computeCommissionInfo(dailyPrice)
  const newPeriodCommissionInfo = computeCommissionInfo(newPeriod.dailyPrice)
  const editingPeriodCommissionInfo = computeCommissionInfo(editingPeriod?.dailyPrice ?? null)
  const sortedPricePeriods = useMemo(
    () =>
      pricePeriods.slice().sort((a, b) => {
        if (a.startDate && b.startDate) {
          return a.startDate.getTime() - b.startDate.getTime()
        }

        if (a.startDate) {
          return -1
        }

        if (b.startDate) {
          return 1
        }

        return 0
      }),
    [pricePeriods]
  )

  const isEditDialogOpen = editingPeriodIndex !== null && editingPeriod !== null

  const getPeriodValidationError = (period: PricePeriod | null): string | null => {
    if (!period) {
      return strings.PERIOD_REQUIRED_ERROR
    }

    const { startDate, endDate, dailyPrice } = period

    if (!startDate || !endDate || dailyPrice === null || dailyPrice === undefined) {
      return strings.PERIOD_REQUIRED_ERROR
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return strings.PERIOD_REQUIRED_ERROR
    }

    if (start > end) {
      return strings.PERIOD_DATE_ORDER_ERROR
    }

    const numericPrice = typeof dailyPrice === 'string' ? Number.parseFloat(dailyPrice) : dailyPrice

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return strings.PERIOD_PRICE_ERROR
    }

    return null
  }

  const isEditingPeriodValid = !getPeriodValidationError(editingPeriod)

  const handleAddPeriod = () => {
    const validationError = getPeriodValidationError(newPeriod)

    if (validationError) {
      setNewPeriodError(validationError)
      return
    }

    if (newPeriod.startDate && newPeriod.endDate && newPeriod.dailyPrice !== null) {
      const start = new Date(newPeriod.startDate)
      const end = new Date(newPeriod.endDate)
      const dailyPriceValue =
        typeof newPeriod.dailyPrice === 'string'
          ? Number.parseFloat(newPeriod.dailyPrice)
          : newPeriod.dailyPrice

      setPricePeriods([
        ...pricePeriods,
        {
          ...newPeriod,
          startDate: start,
          endDate: end,
          dailyPrice: dailyPriceValue,
        },
      ])
      setNewPeriod({ startDate: null, endDate: null, dailyPrice: null, reason: '' })
      setNewPeriodError(null)
    }
  }

  const handleDeletePeriod = (index: number) => {
    const updatedPeriods = pricePeriods.filter((_, i) => i !== index)
    setPricePeriods(updatedPeriods)
  }

  const handleEditPeriod = (index: number) => {
    const periodToEdit = pricePeriods[index]
    setEditingPeriodIndex(index)
    setEditingPeriod({
      startDate: periodToEdit.startDate,
      endDate: periodToEdit.endDate,
      dailyPrice: periodToEdit.dailyPrice,
      reason: periodToEdit.reason || '',
    })
    setEditPeriodError(null)
  }

  const handleEditingPeriodChange = <K extends keyof PricePeriod>(key: K, value: PricePeriod[K]) => {
    setEditingPeriod((prev) => (prev ? { ...prev, [key]: value } : prev))
    setEditPeriodError(null)
  }

  const handleCloseEditPeriod = () => {
    setEditingPeriodIndex(null)
    setEditingPeriod(null)
    setEditPeriodError(null)
  }

  const handleSaveEditedPeriod = () => {
    if (editingPeriodIndex === null || !editingPeriod) {
      return
    }

    const validationError = getPeriodValidationError(editingPeriod)

    if (validationError) {
      setEditPeriodError(validationError)
      return
    }

    const updatedPeriods = pricePeriods.slice()
    updatedPeriods[editingPeriodIndex] = {
      ...editingPeriod,
      startDate: editingPeriod.startDate ? new Date(editingPeriod.startDate) : null,
      endDate: editingPeriod.endDate ? new Date(editingPeriod.endDate) : null,
      dailyPrice:
        editingPeriod.dailyPrice !== null ? Number.parseFloat(String(editingPeriod.dailyPrice)) : null,
    }

    setPricePeriods(updatedPeriods)
    setEditPeriodError(null)
    handleCloseEditPeriod()
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
  }

  const handleDailyPriceBlur = () => {
    const base = Number(dailyPrice)
    if (!autoDefaultsApplied && pricePeriods.length === 0 && Number.isFinite(base) && base > 0) {
      handleApplyDefaultPeriods()
      setAutoDefaultsApplied(true)
    }
  }

  const handleAddUnavailablePeriod = () => {
    if (newUnavailablePeriod.startDate && newUnavailablePeriod.endDate) {
      setUnavailablePeriods([...unavailablePeriods, newUnavailablePeriod])
      setNewUnavailablePeriod({ startDate: null, endDate: null })
    }
  }

  const handleDeleteUnavailablePeriod = (index: number) => {
    const updatedPeriods = unavailablePeriods.filter((_, i) => i !== index)
    setUnavailablePeriods(updatedPeriods)
  }

  const handleEditUnavailablePeriod = (index: number) => {
    const periodToEdit = unavailablePeriods[index]
    setNewUnavailablePeriod({
      startDate: periodToEdit.startDate,
      endDate: periodToEdit.endDate,
    })
    handleDeleteUnavailablePeriod(index)
  }

  const handleBeforeUpload = () => {
    setLoading(true)
  }

  const handleImageChange = (_image: bookcarsTypes.Car | string | null) => {
    setLoading(false)
    setImage(_image as string)

    if (_image !== null) {
      setImageError(false)
    }
  }

  const handleImageValidate = (valid: boolean) => {
    if (!valid) {
      setImageSizeError(true)
      setImageError(false)
      setFormError(false)
      setLoading(false)
    } else {
      setImageSizeError(false)
      setImageError(false)
      setFormError(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleSupplierChange = (values: bookcarsTypes.Option[]) => {
    setSupplier(values.length > 0 ? values[0]._id : '')
  }

  const handleMinimumDrivingLicenseYears = (_event: Event, value: number | number[]) => {
    if (typeof value === 'number') {
      setMinimumDrivingLicenseYears(value)
      console.log(_event)
    }
  }

  const handleMinimumDrivingLicenseYearsText = (value: number) => `${value} ans`

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

  const handleLocationsChange = (_locations: bookcarsTypes.Option[]) => {
    setLocations(_locations)
    setLocationsError(null) // Effacer l'erreur lorsque l'utilisateur modifie la sélection
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

  const extraToNumber = (extra: string) => (extra === '' ? -1 : Number(extra))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      setLoading(true)

      const _minimumAgeValid = validateMinimumAge(minimumAge)
      if (!_minimumAgeValid) {
        setFormError(true)
        setImageError(false)
        return
      }

      if (!image) {
        setImageError(true)
        setImageSizeError(false)
        return
      }

      // Vérifier si des localisations sont sélectionnées
      if (locations.length === 0) {
        setLocationsError('Veuillez sélectionner au moins une localisation.')
        return
      }
      setLocationsError(null)

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

      const data: bookcarsTypes.CreateCarPayload = {
        name,
        supplier,
        minimumAge: Number.parseInt(minimumAge, 10),
        locations: locations.map((l) => l._id),
        dailyPrice: Number(dailyPrice),
        discountedDailyPrice: null,
        biWeeklyPrice: null,
        discountedBiWeeklyPrice: null,
        weeklyPrice: null,
        discountedWeeklyPrice: null,
        monthlyPrice: null,
        discountedMonthlyPrice: null,
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
        theftProtection: 0,
        collisionDamageWaiver: 0,
        fullInsurance: 0,
        additionalDriver: 0,
        range,
        multimedia,
        rating: Number(rating) || undefined,
        co2: Number(co2) || undefined,
        periodicPrices: pricePeriods,
        minimumDrivingLicenseYears,
        unavailablePeriods,
        minimumRentalDays,
        discounts: discount, // Ajouter le discount au payload
      }

      const car = await CarService.create(data)

      if (car && car._id) {
        navigate('/cars')
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    } finally {
      setLoading(false)
    }
  }

  const onLoad = (user?: bookcarsTypes.User) => {
    if (user && user.verified) {
      setVisible(true)

      if (user.type === bookcarsTypes.RecordType.Supplier) {
        setSupplier(user._id as string)
        setIsSupplier(true)
      }
    }
  }

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
      <div className="create-car">
        <Paper className="car-form car-form-wrapper" elevation={10} style={visible ? {} : { display: 'none' }}>
          <h1 className="car-form-title">{strings.NEW_CAR_HEADING}</h1>
          <form onSubmit={handleSubmit}>
            <Avatar
              type={bookcarsTypes.RecordType.Car}
              mode="create"
              record={null}
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

            {!isSupplier && (
              <FormControl fullWidth margin="dense">
                <SupplierSelectList
                  label={strings.SUPPLIER}
                  required
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
                  defaultValue={2}
                  getAriaValueText={handleMinimumDrivingLicenseYearsText}
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
              <LocationSelectList label={strings.LOCATIONS} multiple required variant="standard" onChange={handleLocationsChange} />
              {locationsError && (
                <FormHelperText error>{locationsError}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth margin="dense">
              <TextField
                label={`${strings.AGENCY_DEFAULT_PRICE_LABEL} (${commonStrings.CURRENCY}${commonStrings.DAILY})`}
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    pattern: '^\\d+(.\\d+)?$',
                  },
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setDailyPrice(e.target.value)
                }}
                onBlur={handleDailyPriceBlur}
                required
                variant="standard"
                autoComplete="off"
                value={dailyPrice}
              />
            </FormControl>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography fontWeight={600}>{strings.CLIENT_PRICE_INFO_TITLE}</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Typography variant="body2">
                  {strings.CLIENT_PRICE_INFO_INTRO.replace('{date}', commissionEffectiveDateLabel).replace(
                    '{rate}',
                    commissionRateLabel,
                  )}
                </Typography>
                <Typography variant="body2">{strings.CLIENT_PRICE_INFO_COLLECTION}</Typography>
                <Typography variant="body2">
                  {commissionLinkSegments[0] ?? ''}
                  <Link component={RouterLink} to={commissionManagementPath} underline="hover">
                    {strings.CLIENT_PRICE_INFO_LINK_LABEL}
                  </Link>
                  {commissionLinkSegments[1] ?? ''}
                </Typography>
              </Stack>
              {dailyCommissionInfo && (
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 1 : 3,
                  }}
                >
                  <Typography variant="body2">
                    <strong>{strings.CLIENT_PRICE_LABEL}:</strong>
                    {' '}
                    {formatPriceWithCurrency(dailyCommissionInfo.clientPrice)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: isMobile ? 0.5 : 0 }}>
                    {strings.COMMISSION_DETAIL_WITH_AMOUNT
                      .replace('{rate}', commissionRateLabel)
                      .replace('{amount}', formatPriceWithCurrency(dailyCommissionInfo.commissionValue))}
                  </Typography>
                </Box>
              )}
            </Alert>

            <Card variant="outlined" sx={{ mt: 4 }}>
              <CardHeader
                title={strings.SPECIAL_PRICE_TITLE}
                subheader={strings.SPECIAL_PRICE_SUBHEADER}
                subheaderTypographyProps={{ sx: { whiteSpace: 'normal' } }}
                sx={{
                  '& .MuiCardHeader-content': {
                    minWidth: 0,
                  },
                }}
                action={
                  !isMobile && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={strings.OPTIONAL_BADGE} size="small" color="primary" variant="outlined" />
                      <Button
                        variant="text"
                        startIcon={<AutoAwesomeIcon fontSize="small" />}
                        onClick={handleApplyDefaultPeriods}
                      >
                        {strings.ADD_DEFAULT_PERIODS}
                      </Button>
                    </Stack>
                  )
                }
              />
              <CardContent>
                <Stack spacing={3}>
                  {isMobile && (
                    <Stack spacing={1}>
                      <Chip label={strings.OPTIONAL_BADGE} size="small" color="primary" variant="outlined" />
                      <Button
                        variant="text"
                        startIcon={<AutoAwesomeIcon fontSize="small" />}
                        onClick={handleApplyDefaultPeriods}
                        fullWidth
                      >
                        {strings.ADD_DEFAULT_PERIODS}
                      </Button>
                    </Stack>
                  )}
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth margin="dense">
                        <DateTimePicker
                          label={strings.START_DATE}
                          value={newPeriod.startDate ? new Date(newPeriod.startDate) : undefined}
                          maxDate={newPeriod.endDate ? new Date(newPeriod.endDate) : undefined}
                          onChange={(date) => {
                            setNewPeriod({ ...newPeriod, startDate: date })
                            setNewPeriodError(null)
                          }}
                          language={language}
                          showTime={false}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth margin="dense">
                        <DateTimePicker
                          label={strings.END_DATE}
                          value={newPeriod.endDate ? new Date(newPeriod.endDate) : undefined}
                          minDate={newPeriod.startDate ? new Date(newPeriod.startDate) : undefined}
                          onChange={(date) => {
                            setNewPeriod({ ...newPeriod, endDate: date })
                            setNewPeriodError(null)
                          }}
                          language={language}
                          showTime={false}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth margin="dense">
                        <TextField
                          select
                          label={strings.REASON}
                          value={newPeriod.reason || ''}
                          variant="standard"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setNewPeriod({ ...newPeriod, reason: e.target.value })
                            setNewPeriodError(null)
                          }}
                        >
                          <MenuItem value="">-</MenuItem>
                          <MenuItem value={strings.EID_AL_FITR}>{strings.EID_AL_FITR}</MenuItem>
                          <MenuItem value={strings.EID_AL_ADHA}>{strings.EID_AL_ADHA}</MenuItem>
                          <MenuItem value={strings.SUMMER}>{strings.SUMMER}</MenuItem>
                          <MenuItem value={strings.YEAR_END}>{strings.YEAR_END}</MenuItem>
                        </TextField>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth margin="dense">
                        <TextField
                          label={`${strings.AGENCY_PRICE_LABEL} (${commonStrings.CURRENCY}${commonStrings.DAILY})`}
                          type="number"
                          inputProps={{ min: 0, step: 1 }}
                          value={newPeriod.dailyPrice ?? ''}
                          variant="standard"
                          autoComplete="off"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setNewPeriod({ ...newPeriod, dailyPrice: e.target.value ? Number(e.target.value) : null })
                            setNewPeriodError(null)
                          }}
                        />
                        {newPeriodCommissionInfo && (
                          <FormHelperText sx={{ mt: 1 }}>
                            <strong>{strings.CLIENT_PRICE_LABEL}:</strong>
                            {' '}
                            {formatPriceWithCurrency(newPeriodCommissionInfo.clientPrice)}
                            {' • '}
                            {strings.COMMISSION_DETAIL_WITH_AMOUNT
                              .replace('{rate}', commissionRateLabel)
                              .replace('{amount}', formatPriceWithCurrency(newPeriodCommissionInfo.commissionValue))}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1} sx={{ height: '100%', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          size="medium"
                          onClick={handleAddPeriod}
                          disabled={Boolean(getPeriodValidationError(newPeriod))}
                          fullWidth={isMobile}
                        >
                          {strings.ADD_PERIOD}
                        </Button>
                        {newPeriodError && (
                          <Typography variant="caption" color="error">
                            {newPeriodError}
                          </Typography>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>

                  {sortedPricePeriods.length > 0 && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      {isMobile ? (
                        <Stack spacing={2}>
                          {sortedPricePeriods.map((period, index) => {
                            const commissionInfo = computeCommissionInfo(period.dailyPrice)
                            const agencyPrice =
                              typeof period.dailyPrice === 'number'
                                ? formatPriceWithCurrency(period.dailyPrice)
                                : '—'
                            const clientPrice = commissionInfo
                              ? formatPriceWithCurrency(commissionInfo.clientPrice)
                              : '—'
                            const commissionAmount = commissionInfo
                              ? formatPriceWithCurrency(commissionInfo.commissionValue)
                              : '—'

                            return (
                              <Paper key={`${period.startDate?.toString() ?? 'start'}-${index}`} variant="outlined" sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle2">{strings.START_DATE}</Typography>
                                    <Typography variant="body2">{formatDateForDisplay(period.startDate)}</Typography>
                                  </Stack>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle2">{strings.END_DATE}</Typography>
                                    <Typography variant="body2">{formatDateForDisplay(period.endDate)}</Typography>
                                  </Stack>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle2">{strings.REASON}</Typography>
                                    <Typography variant="body2" sx={{ textAlign: 'right' }}>
                                      {period.reason || '—'}
                                    </Typography>
                                  </Stack>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle2">{strings.AGENCY_PRICE_LABEL}</Typography>
                                    <Typography variant="body2">{agencyPrice}</Typography>
                                  </Stack>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle2">{strings.CLIENT_PRICE_LABEL}</Typography>
                                    <Typography variant="body2">{clientPrice}</Typography>
                                  </Stack>
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle2">{strings.COMMISSION_LABEL}</Typography>
                                    <Typography variant="body2">{commissionAmount}</Typography>
                                  </Stack>
                                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                    <IconButton onClick={() => handleEditPeriod(index)} size="small">
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeletePeriod(index)} size="small" color="error">
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                </Stack>
                              </Paper>
                            )
                          })}
                        </Stack>
                      ) : (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>{strings.START_DATE}</TableCell>
                                <TableCell>{strings.END_DATE}</TableCell>
                                <TableCell>{strings.REASON}</TableCell>
                                <TableCell align="right">{strings.AGENCY_PRICE_COLUMN_LABEL}</TableCell>
                                <TableCell align="right">{strings.CLIENT_PRICE_COLUMN_LABEL}</TableCell>
                                <TableCell align="right">{strings.COMMISSION_COLUMN_LABEL}</TableCell>
                                <TableCell align="center">{strings.ACTIONS_BUTTON}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sortedPricePeriods.map((period, index) => {
                                const commissionInfo = computeCommissionInfo(period.dailyPrice)
                                const agencyPrice =
                                  typeof period.dailyPrice === 'number'
                                    ? formatPriceWithCurrency(period.dailyPrice)
                                    : '—'
                                const clientPrice = commissionInfo
                                  ? formatPriceWithCurrency(commissionInfo.clientPrice)
                                  : '—'
                                const commissionAmount = commissionInfo
                                  ? formatPriceWithCurrency(commissionInfo.commissionValue)
                                  : '—'

                                return (
                                  <TableRow key={`${period.startDate?.toString() ?? 'period'}-${index}`} hover>
                                    <TableCell>{formatDateForDisplay(period.startDate)}</TableCell>
                                    <TableCell>{formatDateForDisplay(period.endDate)}</TableCell>
                                    <TableCell>{period.reason || '—'}</TableCell>
                                    <TableCell align="right">{agencyPrice}</TableCell>
                                    <TableCell align="right">{clientPrice}</TableCell>
                                    <TableCell align="right">{commissionAmount}</TableCell>
                                    <TableCell align="center">
                                      <IconButton onClick={() => handleEditPeriod(index)} size="small" sx={{ mr: 1 }}>
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton onClick={() => handleDeletePeriod(index)} size="small" color="error">
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

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

            <FormControl fullWidth margin="dense">
              <TextField
                label={`${csStrings.DEPOSIT} (${commonStrings.CURRENCY})`}
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    pattern: '^\\d+(.\\d+)?$',
                  },
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
                  },
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
                      paddingBottom: '3px',
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
                    language={language}
                    showTime={false}
                  />
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <DateTimePicker
                    label={strings.END_DATE}
                    value={newUnavailablePeriod.endDate ? new Date(newUnavailablePeriod.endDate) : undefined}
                    minDate={newUnavailablePeriod.startDate ? new Date(newUnavailablePeriod.startDate) : undefined} // Limite la date min en fonction de la date de début
                    onChange={(date) => setNewUnavailablePeriod({ ...newUnavailablePeriod, endDate: date })}
                    language={language}
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
              <CarTypeList label={strings.CAR_TYPE} variant="standard" required onChange={handleCarTypeChange} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <GearboxList label={strings.GEARBOX} variant="standard" required onChange={handleGearboxChange} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <SeatsList label={strings.SEATS} variant="standard" required onChange={handleSeatsChange} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <DoorsList label={strings.DOORS} variant="standard" required onChange={handleDoorsChange} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <FuelPolicyList label={csStrings.FUEL_POLICY} variant="standard" required onChange={handleFuelPolicyChange} />
            </FormControl>

            <div className="info">
              <InfoIcon />
              <span>{commonStrings.OPTIONAL}</span>
            </div>

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

            <div className="buttons">
              <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small" disabled={loading}>
                {commonStrings.CREATE}
              </Button>
              <Button
                variant="contained"
                className="btn-secondary btn-margin-bottom"
                size="small"
                onClick={async () => {
                  if (image) {
                    await CarService.deleteTempImage(image)
                  }
                  navigate('/cars')
                }}
              >
                {commonStrings.CANCEL}
              </Button>
            </div>

            <div className="form-error">
              {imageError && <Error message={commonStrings.IMAGE_REQUIRED} />}
              {imageSizeError && <Error message={strings.CAR_IMAGE_SIZE_ERROR} />}
              {formError && <Error message={commonStrings.FORM_ERROR} />}
            </div>
          </form>
        </Paper>
      </div>
      <Dialog open={isEditDialogOpen} onClose={handleCloseEditPeriod} fullWidth maxWidth="sm">
        <DialogTitle>{strings.EDIT_PERIOD_TITLE}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {strings.EDIT_PERIOD_DESCRIPTION}
            </Typography>
            <FormControl fullWidth>
              <DateTimePicker
                label={strings.START_DATE}
                value={editingPeriod?.startDate ? new Date(editingPeriod.startDate) : undefined}
                maxDate={editingPeriod?.endDate ? new Date(editingPeriod.endDate) : undefined}
                onChange={(date) => handleEditingPeriodChange('startDate', date ?? null)}
                language={language}
                showTime={false}
              />
            </FormControl>
            <FormControl fullWidth>
              <DateTimePicker
                label={strings.END_DATE}
                value={editingPeriod?.endDate ? new Date(editingPeriod.endDate) : undefined}
                minDate={editingPeriod?.startDate ? new Date(editingPeriod.startDate) : undefined}
                onChange={(date) => handleEditingPeriodChange('endDate', date ?? null)}
                language={language}
                showTime={false}
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                select
                label={strings.REASON}
                value={editingPeriod?.reason || ''}
                variant="standard"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleEditingPeriodChange('reason', e.target.value || '')}
              >
                <MenuItem value="">-</MenuItem>
                <MenuItem value={strings.EID_AL_FITR}>{strings.EID_AL_FITR}</MenuItem>
                <MenuItem value={strings.EID_AL_ADHA}>{strings.EID_AL_ADHA}</MenuItem>
                <MenuItem value={strings.SUMMER}>{strings.SUMMER}</MenuItem>
                <MenuItem value={strings.YEAR_END}>{strings.YEAR_END}</MenuItem>
              </TextField>
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label={`${strings.AGENCY_PRICE_LABEL} (${commonStrings.CURRENCY}${commonStrings.DAILY})`}
                type="number"
                inputProps={{ min: 0, step: 1 }}
                value={editingPeriod?.dailyPrice ?? ''}
                variant="standard"
                autoComplete="off"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleEditingPeriodChange('dailyPrice', e.target.value ? Number(e.target.value) : null)}
              />
              {editingPeriodCommissionInfo && (
                <FormHelperText sx={{ mt: 1 }}>
                  <strong>{strings.CLIENT_PRICE_LABEL}:</strong>
                  {' '}
                  {formatPriceWithCurrency(editingPeriodCommissionInfo.clientPrice)}
                  {' • '}
                  {strings.COMMISSION_DETAIL_WITH_AMOUNT
                    .replace('{rate}', commissionRateLabel)
                    .replace('{amount}', formatPriceWithCurrency(editingPeriodCommissionInfo.commissionValue))}
                </FormHelperText>
              )}
            </FormControl>
            {editPeriodError && (
              <Typography variant="body2" color="error">
                {editPeriodError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditPeriod} color="inherit">
            {commonStrings.CANCEL}
          </Button>
          <Button onClick={handleSaveEditedPeriod} variant="contained" disabled={!isEditingPeriodValid}>
            {strings.SAVE_CHANGES}
          </Button>
        </DialogActions>
      </Dialog>
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
    </Layout>
  )
}

export default CreateCar
