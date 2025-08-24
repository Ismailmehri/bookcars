import React, { useCallback, useState } from 'react'
import { GoogleReCaptcha } from 'react-google-recaptcha-v3'
import validator from 'validator'
import { intervalToDuration } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import PhoneInput, { Value } from 'react-phone-number-input'
import fr from 'react-phone-number-input/locale/fr'
import { Helmet } from 'react-helmet'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'
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
import 'react-phone-number-input/style.css'

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
  const [phone, setPhone] = useState<Value>()
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
        phone: phone || '',
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
    name: 'Créer un compte - Plany.tn',
    description:
      'Inscrivez-vous sur Plany.tn pour louer une voiture en Tunisie. Créez votre compte en quelques étapes simples et découvrez nos offres exclusives.',
    url: 'https://plany.tn/sign-up',
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
  const description = buildDescription(
    'Créez votre compte Plany.tn pour réserver une voiture en Tunisie. Inscription rapide et gratuite.'
  )
  return (
    <ReCaptchaProvider>
      <Layout strict={false} onLoad={onLoad}>
        <Seo
          title="Inscription - Plany.tn"
          description={description}
          canonical="https://plany.tn/sign-up"
          robots="noindex,nofollow"
        />
        <Helmet>
          <meta charSet="utf-8" />
          <meta property="og:title" content="Inscription - Plany.tn" />
          <meta
            property="og:description"
            content="Créez votre compte Plany.tn pour réserver une voiture en Tunisie. Inscription rapide et gratuite."
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://plany.tn/sign-up" />
          <meta property="og:image" content="https://plany.tn/logo.png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content="Plany" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Inscription - Plany.tn" />
          <meta
            name="twitter:description"
            content="Créez votre compte Plany.tn pour réserver une voiture en Tunisie. Inscription rapide et gratuite."
          />
          <meta name="twitter:image" content="https://plany.tn/logo.png" />
          <meta name="twitter:image:width" content="1200" />
          <meta name="twitter:image:height" content="630" />
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </Helmet>
        {visible && (
          <div className="flex justify-center p-3">
            <div className="w-full max-w-md bg-white rounded shadow-card p-5">
              <h1 className="text-2xl font-bold mb-4">{strings.SIGN_UP_HEADING}</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1 required">
                    {commonStrings.FULL_NAME}
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={handleFullNameChange}
                    required
                    autoComplete="off"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1 required">
                    {commonStrings.EMAIL}
                  </label>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onBlur={handleEmailBlur}
                    onChange={handleEmailChange}
                    required
                    autoComplete="off"
                    className={`w-full p-2 border rounded ${(!emailValid || emailError) ? 'border-red-500' : ''}`}
                  />
                  <div className="text-xs text-red-500">
                    {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                    {(emailError && commonStrings.EMAIL_ALREADY_REGISTERED) || ''}
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1 required">
                    {commonStrings.PHONE}
                  </label>
                  <PhoneInput
                    id="phone"
                    labels={fr}
                    placeholder={commonStrings.PHONE}
                    international
                    defaultCountry="TN"
                    value={phone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    className="w-full p-2 border rounded"
                  />
                  <div className="text-xs text-red-500">
                    {(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}
                  </div>
                </div>
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium mb-1 required">
                    {commonStrings.BIRTH_DATE}
                  </label>
                  <DatePicker
                    id="birthDate"
                    label={commonStrings.BIRTH_DATE}
                    value={birthDate}
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
                  <div className="text-xs text-red-500">
                    {(!birthDateValid && commonStrings.BIRTH_DATE_NOT_VALID) || ''}
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1 required">
                    {commonStrings.PASSWORD}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    className="w-full p-2 border rounded"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 required">
                    {commonStrings.CONFIRM_PASSWORD}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    className="w-full p-2 border rounded"
                    autoComplete="new-password"
                  />
                </div>
                {env.RECAPTCHA_ENABLED && (
                  <div className="recaptcha">
                    <GoogleReCaptcha onVerify={handleRecaptchaVerify} />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={tosChecked}
                    onChange={handleTosChange}
                    className="h-4 w-4"
                  />
                  <a href="/tos" target="_blank" rel="noreferrer" className="text-primary underline">
                    {commonStrings.TOS}
                  </a>
                </div>
                <SocialLogin />
                <div className="flex space-x-2">
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
                    {strings.SIGN_UP}
                  </button>
                  <a href="/" className="px-4 py-2 bg-secondary text-white rounded">
                    {commonStrings.CANCEL}
                  </a>
                </div>
                <div>
                  {passwordError && <Error message={commonStrings.PASSWORD_ERROR} />}
                  {passwordsDontMatch && <Error message={commonStrings.PASSWORDS_DONT_MATCH} />}
                  {recaptchaError && <Error message={commonStrings.RECAPTCHA_ERROR} />}
                  {tosError && <Error message={commonStrings.TOS_ERROR} />}
                  {error && <Error message={strings.SIGN_UP_ERROR} />}
                </div>
              </form>
            </div>
          </div>
        )}
        {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
      </Layout>
    </ReCaptchaProvider>
  )
}

export default SignUp
