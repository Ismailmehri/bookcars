import React, { useCallback, useState } from 'react'
import { GoogleReCaptcha } from 'react-google-recaptcha-v3'
import {
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Checkbox,
  Link,
} from '@mui/material'
import validator from 'validator'
import { intervalToDuration } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import PhoneInput, { Value } from 'react-phone-number-input' // Import Value
import fr from 'react-phone-number-input/locale/fr'
import { Helmet } from 'react-helmet'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import * as helper from '@/common/helper'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/sign-up'
import * as UserService from '@/services/UserService'
import Layout from '@/components/Layout'
import Error from '@/components/Error'
import Backdrop from '@/components/SimpleBackdrop'
import DatePicker from '@/components/DatePicker'
import ReCaptchaProvider from '@/components/ReCaptchaProvider'
import SocialLogin from '@/components/SocialLogin'
import 'react-phone-number-input/style.css' // Import du style

import '@/assets/css/signup.css' // Votre fichier CSS personnalisé

const SignUp = () => {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(env.DEFAULT_LANGUAGE)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [birthDate, setBirthDate] = useState<Date>()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(false)
  const [recaptchaError, setRecaptchaError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [passwordsDontMatch, setPasswordsDontMatch] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailValid, setEmailValid] = useState(true)
  const [tosChecked, setTosChecked] = useState(false)
  const [tosError, setTosError] = useState(false)
  const [phoneValid, setPhoneValid] = useState(true)
  const [phone, setPhone] = useState<Value>() // Utilisez Value
  const [birthDateValid, setBirthDateValid] = useState(true)

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)

    if (!e.target.value) {
      setEmailError(false)
      setEmailValid(true)
    }
  }

  const validateEmail = async (_email?: string) => {
    if (_email) {
      if (validator.isEmail(_email)) {
        try {
          const status = await UserService.validateEmail({ email: _email })
          if (status === 200) {
            setEmailError(false)
            setEmailValid(true)
            return true
          }
          setEmailError(true)
          setEmailValid(true)
          setError(false)
          return false
        } catch (err) {
          helper.error(err)
          setEmailError(false)
          setEmailValid(true)
          return false
        }
      } else {
        setEmailError(false)
        setEmailValid(false)
        return false
      }
    } else {
      setEmailError(false)
      setEmailValid(true)
      return false
    }
  }

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await validateEmail(e.target.value)
  }

  const validatePhone = (_phone?: Value) => {
    if (_phone) {
      const _phoneValid = validator.isMobilePhone(_phone)
      setPhoneValid(_phoneValid)

      return _phoneValid
    }
    setPhoneValid(false)

    return false
  }

  const handlePhoneChange = (value: Value) => {
    setPhone(value)

    if (!value) {
      setPhoneValid(true)
    }
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  const handleRecaptchaVerify = useCallback(async (token: string) => {
    try {
      const ip = await UserService.getIP()
      const status = await UserService.verifyRecaptcha(token, ip)
      const valid = status === 200
      setRecaptchaError(!valid)
    } catch (err) {
      helper.error(err)
      setRecaptchaError(true)
    }
  }, [])

  const handleTosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTosChecked(e.target.checked)

    if (e.target.checked) {
      setTosError(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      const _emailValid = await validateEmail(email)
      if (!_emailValid) {
        return
      }

      const _phoneValid = validatePhone(phone)
      if (!_phoneValid) {
        return
      }

      const _birthDateValid = validateBirthDate(birthDate)
      if (!birthDate || !_birthDateValid) {
        return
      }

      if (password.length < 6) {
        setPasswordError(true)
        setRecaptchaError(false)
        setPasswordsDontMatch(false)
        setError(false)
        setTosError(false)
        return
      }

      if (password !== confirmPassword) {
        setPasswordError(false)
        setRecaptchaError(false)
        setPasswordsDontMatch(true)
        setError(false)
        setTosError(false)
        return
      }

      if (env.RECAPTCHA_ENABLED && recaptchaError) {
        return
      }

      if (!tosChecked) {
        setPasswordError(false)
        setRecaptchaError(false)
        setPasswordsDontMatch(false)
        setError(false)
        setTosError(true)
        return
      }

      setLoading(true)

      const data: bookcarsTypes.SignUpPayload = {
        email,
        phone: phone || '', // Convertir `undefined` en chaîne vide
        password,
        fullName,
        birthDate,
        language: UserService.getLanguage(),
      }

      const status = await UserService.signup(data)

      if (status === 200) {
        const signInResult = await UserService.signin({
          email,
          password,
        })

        if (signInResult.status === 200) {
          navigate(`/${window.location.search}`)
        } else {
          setPasswordError(false)
          setRecaptchaError(false)
          setPasswordsDontMatch(false)
          setError(true)
          setTosError(false)
        }
      } else {
        setPasswordError(false)
        setRecaptchaError(false)
        setPasswordsDontMatch(false)
        setError(true)
        setTosError(false)
      }
    } catch (err) {
      console.error(err)
      setPasswordError(false)
      setRecaptchaError(false)
      setPasswordsDontMatch(false)
      setError(true)
      setTosError(false)
    } finally {
      setLoading(false)
    }
  }

  const onLoad = (user?: bookcarsTypes.User) => {
    if (user) {
      navigate('/')
    } else {
      setLanguage(UserService.getLanguage())
      setVisible(true)
    }
  }
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Se connecter - Plany.tn',
    description:
      'Connectez-vous à votre compte Plany.tn pour louer une voiture en Tunisie. Accédez à vos réservations et gérez vos informations personnelles.',
    url: 'https://plany.tn/sign-in',
    publisher: {
      '@type': 'Organization',
      name: 'Plany.tn',
      logo: {
        '@type': 'ImageObject',
        url: 'https://plany.tn/logo.png',
        width: 1200,
        height: 630,
      },
    },
  }
  return (
    <ReCaptchaProvider>
      <Layout strict={false} onLoad={onLoad}>
        {/* SEO et données structurées */}
        <Helmet>
          <meta charSet="utf-8" />
          <title>Se connecter - Plany.tn</title>
          <meta
            name="description"
            content="Connectez-vous à votre compte Plany.tn pour louer une voiture en Tunisie. Accédez à vos réservations et gérez vos informations personnelles."
          />
          <link rel="canonical" href="https://plany.tn/sign-in" />
          {/* Balises Open Graph */}
          <meta property="og:title" content="Se connecter - Plany.tn" />
          <meta
            property="og:description"
            content="Connectez-vous à votre compte Plany.tn pour louer une voiture en Tunisie. Accédez à vos réservations et gérez vos informations personnelles."
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://plany.tn/sign-in" />
          <meta property="og:image" content="https://plany.tn/logo.png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content="Plany" />
          {/* Balises Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Se connecter - Plany.tn" />
          <meta
            name="twitter:description"
            content="Connectez-vous à votre compte Plany.tn pour louer une voiture en Tunisie. Accédez à vos réservations et gérez vos informations personnelles."
          />
          <meta name="twitter:image" content="https://plany.tn/logo.png" />
          <meta name="twitter:image:width" content="1200" />
          <meta name="twitter:image:height" content="630" />
          {/* Données structurées */}
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </Helmet>
        {visible && (
          <div className="signup">
            <Paper className="signup-form" elevation={10}>
              <h1 className="signup-form-title">{strings.SIGN_UP_HEADING}</h1>
              <form onSubmit={handleSubmit}>
                <div>
                  <FormControl fullWidth margin="dense">
                    <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                    <OutlinedInput
                      type="text"
                      label={commonStrings.FULL_NAME}
                      value={fullName}
                      required
                      onChange={handleFullNameChange}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                    <OutlinedInput
                      type="text"
                      label={commonStrings.EMAIL}
                      error={!emailValid || emailError}
                      value={email}
                      onBlur={handleEmailBlur}
                      onChange={handleEmailChange}
                      required
                      autoComplete="off"
                    />
                    <FormHelperText error={!emailValid || emailError}>
                      {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                      {(emailError && commonStrings.EMAIL_ALREADY_REGISTERED) || ''}
                    </FormHelperText>
                  </FormControl>
                  <InputLabel htmlFor="phone-input" className="required">{commonStrings.PHONE}</InputLabel>
                  <FormControl fullWidth margin="dense">
                    <PhoneInput
                      labels={fr}
                      placeholder={commonStrings.PHONE}
                      international
                      defaultCountry="TN"
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={handlePhoneBlur}
                      className="phone-input" // Appliquez la classe personnalisée
                    />
                    <FormHelperText error={!phoneValid}>{(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}</FormHelperText>
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <DatePicker
                      label={commonStrings.BIRTH_DATE}
                      value={birthDate}
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
                    <FormHelperText error={!birthDateValid}>{(!birthDateValid && commonStrings.BIRTH_DATE_NOT_VALID) || ''}</FormHelperText>
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <InputLabel className="required">{commonStrings.PASSWORD}</InputLabel>
                    <OutlinedInput
                      label={commonStrings.PASSWORD}
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      type="password"
                      inputProps={{
                        autoComplete: 'new-password',
                        form: {
                          autoComplete: 'off',
                        },
                      }}
                    />
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <InputLabel className="required">{commonStrings.CONFIRM_PASSWORD}</InputLabel>
                    <OutlinedInput
                      label={commonStrings.CONFIRM_PASSWORD}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      required
                      type="password"
                      inputProps={{
                        autoComplete: 'new-password',
                        form: {
                          autoComplete: 'off',
                        },
                      }}
                    />
                  </FormControl>

                  {env.RECAPTCHA_ENABLED && (
                    <div className="recaptcha">
                      <GoogleReCaptcha onVerify={handleRecaptchaVerify} />
                    </div>
                  )}

                  <div className="signup-tos">
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

                  <div className="signup-buttons">
                    <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                      {strings.SIGN_UP}
                    </Button>
                    <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" href="/">
                      {commonStrings.CANCEL}
                    </Button>
                  </div>
                </div>
                <div className="form-error">
                  {passwordError && <Error message={commonStrings.PASSWORD_ERROR} />}
                  {passwordsDontMatch && <Error message={commonStrings.PASSWORDS_DONT_MATCH} />}
                  {recaptchaError && <Error message={commonStrings.RECAPTCHA_ERROR} />}
                  {tosError && <Error message={commonStrings.TOS_ERROR} />}
                  {error && <Error message={strings.SIGN_UP_ERROR} />}
                </div>
              </form>
            </Paper>
          </div>
        )}
        {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
      </Layout>
    </ReCaptchaProvider>
  )
}

export default SignUp
