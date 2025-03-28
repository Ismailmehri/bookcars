import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Input,
  InputLabel,
  FormHelperText,
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  Paper,
} from '@mui/material'
import validator from 'validator'
import { intervalToDuration } from 'date-fns'
import PhoneInput, { Value } from 'react-phone-number-input' // Import PhoneInput
import fr from 'react-phone-number-input/locale/fr'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import Layout from '@/components/Layout'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/settings'
import * as UserService from '@/services/UserService'
import Backdrop from '@/components/SimpleBackdrop'
import DatePicker from '@/components/DatePicker'
import Avatar from '@/components/Avatar'
import * as helper from '@/common/helper'
import 'react-phone-number-input/style.css' // Import du style

import '@/assets/css/settings.css'

const Settings = () => {
  const navigate = useNavigate()

  const [user, setUser] = useState<bookcarsTypes.User>()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState<Value>() // Utilisez Value pour le type
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [birthDate, setBirthDate] = useState<Date>()
  const [birthDateValid, setBirthDateValid] = useState(true)
  const [phoneValid, setPhoneValid] = useState(true)
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(false)

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)
  }

  const handlePhoneChange = (value: Value) => {
    setPhone(value)

    if (!value) {
      setPhoneValid(true)
    }
  }

  const validatePhone = (_phone?: Value) => {
    if (_phone) {
      if (!_phone.startsWith('+')) {
        _phone = '+216'.concat(_phone) as Value
        setPhone(_phone)
      }
      const _phoneValid = validator.isMobilePhone(_phone)
      setPhoneValid(_phoneValid)

      return _phoneValid
    }
    setPhoneValid(false)

    return false
  }

  const handlePhoneBlur = async () => {
    validatePhone(phone)
  }
  const validateBirthDate = (date?: Date) => {
    if (date && bookcarsHelper.isDate(date)) {
      const now = new Date()
      const sub = intervalToDuration({ start: date, end: now }).years ?? 0
      const _birthDateValid = sub >= env.MINIMUM_AGE

      setBirthDateValid(_birthDateValid)
      return _birthDateValid
    }
    setBirthDateValid(true)
    return true
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value)
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value)
  }

  const handleEmailNotificationsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (user && user._id) {
        setEnableEmailNotifications(e.target.checked)

        user.enableEmailNotifications = e.target.checked

        const payload: bookcarsTypes.UpdateEmailNotificationsPayload = {
          _id: user._id,
          enableEmailNotifications: user.enableEmailNotifications,
        }
        const status = await UserService.updateEmailNotifications(payload)

        if (status === 200) {
          setUser(user)
          helper.info(strings.SETTINGS_UPDATED)
        }
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  const onBeforeUpload = () => {
    setLoading(true)
  }

  const onAvatarChange = (_user: bookcarsTypes.User) => {
    setUser(_user)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      if (!user || !user._id) {
        helper.error()
        return
      }

      const _phoneValid = validatePhone(phone)
      if (!_phoneValid) {
        return
      }

      const _birthDateValid = validateBirthDate(birthDate)
      if (!_birthDateValid) {
        return
      }

      const data: bookcarsTypes.UpdateUserPayload = {
        _id: user._id,
        fullName,
        birthDate,
        phone: phone || '', // Convertir en chaîne vide si undefined
        location,
        bio,
      }

      const status = await UserService.updateUser(data)

      if (status === 200) {
        helper.info(strings.SETTINGS_UPDATED)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  const onLoad = (_user?: bookcarsTypes.User) => {
    if (_user) {
      setUser(_user)
      setFullName(_user.fullName)
      setPhone(_user.phone as Value || undefined) // Initialiser avec une chaîne vide si undefined
      validatePhone(_user.phone as Value)
      setBirthDate(_user && _user.birthDate ? new Date(_user.birthDate) : undefined)
      setLocation(_user.location || '')
      setBio(_user.bio || '')
      setEnableEmailNotifications(_user.enableEmailNotifications ?? true)
      setVisible(true)
      setLoading(false)
    }
  }

  return (
    <Layout onLoad={onLoad} user={user} strict>
      {visible && user && (
        <div className="settings">
          <Paper className="settings-form settings-form-wrapper" elevation={10}>
            <form onSubmit={handleSubmit}>
              <Avatar
                loggedUser={user}
                user={user}
                size="large"
                readonly={false}
                onBeforeUpload={onBeforeUpload}
                onChange={onAvatarChange}
                color="disabled"
                className="avatar-ctn"
              />
              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                <Input type="text" required onChange={handleFullNameChange} autoComplete="off" value={fullName} />
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                <Input type="text" value={user.email} disabled />
              </FormControl>
              <InputLabel className="required" sx={{ fontSize: '0.75rem' }}>{commonStrings.PHONE}</InputLabel>
              <FormControl fullWidth margin="dense">
                <PhoneInput
                  labels={fr}
                  placeholder={commonStrings.PHONE}
                  international
                  defaultCountry="TN" // Définir le pays par défaut
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  className="phone-input" // Appliquer une classe personnalisée
                />
                <FormHelperText error={!phoneValid}>{(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}</FormHelperText>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <DatePicker
                  label={commonStrings.BIRTH_DATE}
                  value={birthDate}
                  variant="standard"
                  required
                  onChange={(_birthDate) => {
                    if (_birthDate) {
                      const _birthDateValid = validateBirthDate(_birthDate)

                      setBirthDate(_birthDate)
                      setBirthDateValid(_birthDateValid)
                    }
                  }}
                  language={user.language}
                />
                <FormHelperText error={!birthDateValid}>{(!birthDateValid && commonStrings.BIRTH_DATE_NOT_VALID) || ''}</FormHelperText>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.LOCATION}</InputLabel>
                <Input id="location" type="text" onChange={handleLocationChange} autoComplete="off" value={location} />
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.BIO}</InputLabel>
                <Input id="bio" type="text" onChange={handleBioChange} autoComplete="off" value={bio} />
              </FormControl>
              <div className="buttons">
                <Button
                  variant="contained"
                  className="btn-primary btn-margin btn-margin-bottom"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/change-password')
                  }}
                >
                  {commonStrings.RESET_PASSWORD}
                </Button>
                <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                  {commonStrings.SAVE}
                </Button>
                <Button
                  variant="contained"
                  className="btn-secondary btn-margin-bottom"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/')
                  }}
                >
                  {commonStrings.CANCEL}
                </Button>
              </div>
            </form>
          </Paper>
          <Paper className="settings-net settings-net-wrapper" elevation={10}>
            <h1 className="settings-form-title">{strings.NETWORK_SETTINGS}</h1>
            <FormControl component="fieldset">
              <FormControlLabel
                control={<Switch checked={enableEmailNotifications} onChange={handleEmailNotificationsChange} />}
                label={strings.SETTINGS_EMAIL_NOTIFICATIONS}
              />
            </FormControl>
          </Paper>
        </div>
      )}
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
    </Layout>
  )
}

export default Settings
