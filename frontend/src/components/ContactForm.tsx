import React, { useCallback, useEffect, useState } from 'react'
import { GoogleReCaptcha } from 'react-google-recaptcha-v3'
import {
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material'
import validator from 'validator'
import { useNavigate } from 'react-router-dom'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/contact-form'
import * as UserService from '@/services/UserService'
import ReCaptchaProvider from '@/components/ReCaptchaProvider'
import * as helper from '@/common/helper'
import { sendLeadEvent } from '@/common/gtm'

import '@/assets/css/contact-form.css'

interface ContactFormProps {
  user?: bookcarsTypes.User
  className?: string
}

const ContactForm = ({ user, className }: ContactFormProps) => {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [emailValid, setEmailValid] = useState(true)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'empty' | 'success' | 'error' | 'disabled'>(
    env.RECAPTCHA_ENABLED ? 'idle' : 'disabled'
  )
  const [statusMessage, setStatusMessage] = useState(
    env.RECAPTCHA_ENABLED ? '' : strings.RECAPTCHA_DISABLED
  )

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true)
      setEmail(user.email!)
    }
  }, [user])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)

    if (!e.target.value) {
      setEmailValid(true)
    }
  }

  const validateEmail = (_email?: string) => {
    if (_email) {
      const valid = validator.isEmail(_email)
      setEmailValid(valid)
      return valid
    }
    setEmailValid(true)
    return false
  }

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await validateEmail(e.target.value)
  }

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value)
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
  }

  const handleRecaptchaVerify = useCallback(async (token: string) => {
    setRecaptchaToken(token)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setSending(true)
      setStatus('idle')
      setStatusMessage('')
      e.preventDefault()

      if (!subject.trim() || !message.trim()) {
        setStatus('empty')
        setStatusMessage(strings.EMPTY_STATE)
        return
      }

      const _emailValid = await validateEmail(email)
      if (!_emailValid) {
        setStatus('error')
        setStatusMessage(commonStrings.EMAIL_NOT_VALID)
        return
      }

      const ip = await UserService.getIP()

      const payload: bookcarsTypes.SendEmailPayload = {
        from: email,
        to: env.CONTACT_EMAIL,
        subject,
        message,
        recaptchaToken,
        ip
      }
      const status = await UserService.sendEmail(payload)

      if (status === 200) {
        sendLeadEvent({
          source: 'contact-form',
          hasEmail: Boolean(email),
          subject,
          messageLength: message.trim().length,
          isAuthenticated,
          email,
        })

        if (!isAuthenticated) {
          setEmail('')
        }
        setSubject('')
        setMessage('')
        setStatus('success')
        setStatusMessage(strings.MESSAGE_SENT)
        helper.info(strings.MESSAGE_SENT)
      } else {
        helper.error()
        setStatus('error')
        setStatusMessage(commonStrings.GENERIC_ERROR)
      }
    } catch (err) {
      helper.error(err)
      setStatus('error')
      setStatusMessage(commonStrings.GENERIC_ERROR)
    } finally {
      setSending(false)
      setRefreshReCaptcha((refresh) => !refresh)
    }
  }

  return (
    <ReCaptchaProvider>
      <section className={`contact-form ${className ? `${className} ` : ''}${!env.RECAPTCHA_ENABLED ? 'contact-form--disabled' : ''}`}>
        <div className="contact-form__heading">
          <h1 className="contact-form__title">{strings.CONTACT_HEADING}</h1>
          <p className="contact-form__subtitle">{strings.CTA}</p>
        </div>

        <div className="contact-form__card">
          <form onSubmit={handleSubmit} aria-live="polite">
            {!isAuthenticated && (
              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                <OutlinedInput
                  type="text"
                  label={commonStrings.EMAIL}
                  error={!emailValid}
                  value={email}
                  onBlur={handleEmailBlur}
                  onChange={handleEmailChange}
                  required
                  autoComplete="off"
                  aria-invalid={!emailValid}
                />
                <FormHelperText error={!emailValid}>
                  {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                </FormHelperText>
              </FormControl>
            )}

            <FormControl fullWidth margin="dense">
              <InputLabel className="required">{strings.SUBJECT}</InputLabel>
              <OutlinedInput type="text" label={strings.SUBJECT} value={subject} required onChange={handleSubjectChange} autoComplete="off" />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel className="required">{strings.MESSAGE}</InputLabel>
              <OutlinedInput
                type="text"
                label={strings.MESSAGE}
                onChange={handleMessageChange}
                autoComplete="off"
                value={message}
                required
                multiline
                minRows={7}
                maxRows={7}
              />
            </FormControl>

            <div className="contact-form__recaptcha">
              {env.RECAPTCHA_ENABLED ? (
                <GoogleReCaptcha
                  refreshReCaptcha={refreshReCaptcha}
                  onVerify={handleRecaptchaVerify}
                />
              ) : (
                <span className="contact-form__recaptcha-placeholder">{strings.RECAPTCHA_DISABLED}</span>
              )}
            </div>

            <div className="contact-form__status" role="status" aria-live="polite">
              {status !== 'idle' && statusMessage && (
                <Alert severity={status === 'success' ? 'success' : status === 'empty' ? 'warning' : 'error'}>{statusMessage}</Alert>
              )}
            </div>

            <div className="contact-form__actions">
              <Button type="submit" variant="contained" className="btn-primary" size="small" disabled={sending || status === 'disabled'}>
                {sending ? <CircularProgress color="inherit" size={24} /> : strings.SEND}
              </Button>
              <Button
                variant="outlined"
                className="btn-secondary"
                size="small"
                onClick={() => {
                  navigate('/')
                }}
              >
                {commonStrings.CANCEL}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </ReCaptchaProvider>
  )
}

export default ContactForm
