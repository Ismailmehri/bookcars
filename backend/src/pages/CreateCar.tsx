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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material'
import { Delete as DeleteIcon, Edit as EditIcon, Info as InfoIcon, Add as AddIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
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

interface PricePeriod {
  startDate: null | Date;
  endDate: null | Date;
  dailyPrice: null | number;
}

interface UnavailablePeriod {
  startDate: Date | null;
  endDate: Date | null;
}

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
  const [theftProtection, setTheftProtection] = useState('')
  const [collisionDamageWaiver, setCollisionDamageWaiver] = useState('')
  const [fullInsurance, setFullInsurance] = useState('')
  const [additionalDriver, setAdditionalDriver] = useState('')
  const [minimumAge, setMinimumAge] = useState(String(env.MINIMUM_AGE))
  const [minimumAgeValid, setMinimumAgeValid] = useState(true)
  const [formError, setFormError] = useState(false)
  const [deposit, setDeposit] = useState('')
  const [pricePeriods, setPricePeriods] = useState<PricePeriod[]>([])
  const [unavailablePeriods, setUnavailablePeriods] = useState<UnavailablePeriod[]>([])
  const [newPeriod, setNewPeriod] = useState<PricePeriod>({
    startDate: null,
    endDate: null,
    dailyPrice: null,
  })
  const [newUnavailablePeriod, setNewUnavailablePeriod] = useState<UnavailablePeriod>({
    startDate: null,
    endDate: null,
  })

  const handleAddPeriod = () => {
    if (newPeriod.startDate && newPeriod.endDate && newPeriod.dailyPrice) {
      const start = new Date(newPeriod.startDate)
      const end = new Date(newPeriod.endDate)
      if (start <= end) {
        setPricePeriods([...pricePeriods, { ...newPeriod, startDate: start, endDate: end }])
        setNewPeriod({ startDate: null, endDate: null, dailyPrice: null })
      }
    }
  }

  const handleDeletePeriod = (index: number) => {
    const updatedPeriods = pricePeriods.filter((_, i) => i !== index)
    setPricePeriods(updatedPeriods)
  }

  const handleEditPeriod = (index: number) => {
    const periodToEdit = pricePeriods[index]
    setNewPeriod({
      startDate: periodToEdit.startDate,
      endDate: periodToEdit.endDate,
      dailyPrice: periodToEdit.dailyPrice,
    })
    handleDeletePeriod(index)
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
        theftProtection: extraToNumber(theftProtection),
        collisionDamageWaiver: extraToNumber(collisionDamageWaiver),
        fullInsurance: extraToNumber(fullInsurance),
        additionalDriver: extraToNumber(additionalDriver),
        range,
        multimedia,
        rating: Number(rating) || undefined,
        co2: Number(co2) || undefined,
        periodicPrices: pricePeriods,
        unavailablePeriods, // Ajoutez les périodes d'indisponibilité ici
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
              <LocationSelectList label={strings.LOCATIONS} multiple required variant="standard" onChange={handleLocationsChange} />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <TextField
                label={`${strings.DAILY_PRICE} (${commonStrings.CURRENCY})`}
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    pattern: '^\\d+(.\\d+)?$',
                  },
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
              <span className="text-title">Ajouter un tarif spécial pour des périodes spécifiques (par exemple juin, juillet, août ou fin décembre)</span>
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
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <FormControl fullWidth margin="dense">
                  <DateTimePicker
                    label={strings.START_DATE}
                    value={newPeriod.startDate ? new Date(newPeriod.startDate) : undefined}
                    maxDate={newPeriod.endDate ? new Date(newPeriod.endDate) : undefined}
                    onChange={(date) => setNewPeriod({ ...newPeriod, startDate: date })}
                    language={UserService.getLanguage()}
                  />
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <DateTimePicker
                    label={strings.END_DATE}
                    value={newPeriod.endDate ? new Date(newPeriod.endDate) : undefined}
                    minDate={newPeriod.startDate ? new Date(newPeriod.startDate) : undefined}
                    onChange={(date) => setNewPeriod({ ...newPeriod, endDate: date })}
                    language={UserService.getLanguage()}
                  />
                </FormControl>
                <FormControl className="fixed-width-300" margin="dense">
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPeriod({ ...newPeriod, dailyPrice: Number(e.target.value) })}
                  />
                </FormControl>
                <div className="add-button">
                  <IconButton
                    color="primary"
                    onClick={handleAddPeriod}
                    disabled={!newPeriod.startDate || !newPeriod.endDate || !newPeriod.dailyPrice}
                  >
                    <AddIcon />
                  </IconButton>
                </div>
              </div>
              {pricePeriods.length > 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{strings.START_DATE}</TableCell>
                        <TableCell>{strings.END_DATE}</TableCell>
                        <TableCell>{`${strings.DAILY_PRICE} (${commonStrings.CURRENCY})`}</TableCell>
                        <TableCell>{strings.ACTIONS_BUTTON}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pricePeriods.map((period, index) => (
                        <TableRow key={index}>
                          <TableCell>{period.startDate ? period.startDate.toLocaleDateString() : ''}</TableCell>
                          <TableCell>{period.endDate ? period.endDate.toLocaleDateString() : ''}</TableCell>
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
                    maxDate={newUnavailablePeriod.endDate ? new Date(newUnavailablePeriod.endDate) : undefined}
                    onChange={(date) => setNewUnavailablePeriod({ ...newUnavailablePeriod, startDate: date })}
                    language={UserService.getLanguage()}
                  />
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <DateTimePicker
                    label={strings.END_DATE}
                    value={newUnavailablePeriod.endDate ? new Date(newUnavailablePeriod.endDate) : undefined}
                    minDate={newUnavailablePeriod.startDate ? new Date(newUnavailablePeriod.startDate) : undefined}
                    onChange={(date) => setNewUnavailablePeriod({ ...newUnavailablePeriod, endDate: date })}
                    language={UserService.getLanguage()}
                  />
                </FormControl>
                <div className="add-button" style={{ marginLeft: '15px' }}>
                  <IconButton
                    color="primary"
                    onClick={handleAddUnavailablePeriod}
                    disabled={!newUnavailablePeriod.startDate || !newUnavailablePeriod.endDate}
                  >
                    <AddIcon />
                  </IconButton>
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
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
    </Layout>
  )
}

export default CreateCar
