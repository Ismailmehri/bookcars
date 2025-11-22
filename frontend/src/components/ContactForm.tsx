import React, { useCallback, useEffect, useState } from 'react'
import { GoogleReCaptcha } from 'react-google-recaptcha-v3'
import {
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  CircularProgress,
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
import {
  canSubmitContact,
  isMessageValid,
  isSubjectValid,
  sanitizeContactMessage,
} from '@/pages/contact.utils'

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
  const [subjectValid, setSubjectValid] = useState(true)
  const [messageValid, setMessageValid] = useState(true)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false)
  const [sending, setSending] = useState(false)

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
    const { value } = e.target
    setSubject(value)
    setSubjectValid(isSubjectValid(value))
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setMessage(value)
    setMessageValid(isMessageValid(value))
  }

  const handleRecaptchaVerify = useCallback(async (token: string) => {
    setRecaptchaToken(token)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setSending(true)
      e.preventDefault()

      const _emailValid = await validateEmail(email)
      if (!_emailValid) {
        return
      }

      const _subjectValid = isSubjectValid(subject)
      setSubjectValid(_subjectValid)
      if (!_subjectValid) {
        return
      }

      const _messageValid = isMessageValid(message)
      setMessageValid(_messageValid)
      if (!_messageValid) {
        return
      }

      const ip = await UserService.getIP()

      const payload: bookcarsTypes.SendEmailPayload = {
        from: email,
        to: env.CONTACT_EMAIL,
        subject: subject.trim(),
        message: sanitizeContactMessage(message),
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
        setSubjectValid(true)
        setMessageValid(true)
        helper.info(strings.MESSAGE_SENT)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    } finally {
      setSending(false)
      setRefreshReCaptcha((refresh) => !refresh)
    }
  }

  if (!env.RECAPTCHA_ENABLED) {
    return null
  }

  return (
    <ReCaptchaProvider>
      <Paper className={`${className ? `${className} ` : ''}contact-form`} elevation={10}>
        <h1 className="contact-form-title">
          {' '}
          {strings.CONTACT_HEADING}
          {' '}
        </h1>
        <form onSubmit={handleSubmit}>
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
              />
              <FormHelperText error={!emailValid}>
                {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
              </FormHelperText>
            </FormControl>
          )}

          <FormControl fullWidth margin="dense">
            <InputLabel className="required">{strings.SUBJECT}</InputLabel>
            <OutlinedInput
              type="text"
              label={strings.SUBJECT}
              value={subject}
              required
              error={!subjectValid}
              onChange={handleSubjectChange}
              autoComplete="off"
              inputProps={{ 'aria-describedby': 'contact-subject-helper' }}
            />
            <FormHelperText id="contact-subject-helper" error={!subjectValid}>
              {!subjectValid ? strings.SUBJECT_HELP : strings.SUBJECT_HELP}
            </FormHelperText>
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
              error={!messageValid}
              inputProps={{ 'aria-describedby': 'contact-message-helper' }}
            />
            <FormHelperText id="contact-message-helper" error={!messageValid}>
              {!messageValid ? strings.MESSAGE_HELP : strings.MESSAGE_HELP}
            </FormHelperText>
          </FormControl>

          <div className="recaptcha">
            <GoogleReCaptcha
              refreshReCaptcha={refreshReCaptcha}
              onVerify={handleRecaptchaVerify}
            />
          </div>

          <div className="buttons">
            <Button
              type="submit"
              variant="contained"
              className="btn-primary btn-margin-bottom btn"
              size="small"
              disabled={!canSubmitContact({
                emailValid,
                subject,
                message,
                sending,
                recaptchaToken,
              })}
            >
              {
                sending
                  ? <CircularProgress color="inherit" size={24} />
                  : strings.SEND
              }
            </Button>
            <Button
              variant="contained"
              className="btn-secondary btn-margin-bottom btn"
              size="small"
              onClick={() => {
                navigate('/')
              }}
            >
              {' '}
              {commonStrings.CANCEL}
            </Button>
          </div>
        </form>
      </Paper>
    </ReCaptchaProvider>
  )
}

export default ContactForm
