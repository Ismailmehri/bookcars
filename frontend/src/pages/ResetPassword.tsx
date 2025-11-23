import React, { useState } from 'react'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Seo from '@/components/Seo'
import * as bookcarsTypes from ':bookcars-types'
import * as UserService from '@/services/UserService'
import Layout from '@/components/Layout'
import { strings as commonStrings } from '@/lang/common'
import { strings as cpStrings } from '@/lang/change-password'
import { strings as rpStrings } from '@/lang/reset-password'
import Error from './Error'
import NoMatch from './NoMatch'
import * as helper from '@/common/helper'

import '@/assets/css/auth-forms.css'
import '@/assets/css/reset-password.css'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState(false)
  const [passwordLengthError, setPasswordLengthError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLElement>) => {
    try {
      e.preventDefault()

      setSubmitting(true)

      if (password.length < 6) {
        setPasswordLengthError(true)
        setConfirmPasswordError(false)
        setPasswordError(false)
        return
      }
      setPasswordLengthError(false)
      setPasswordError(false)

      if (password !== confirmPassword) {
        setConfirmPasswordError(true)
        setPasswordError(false)
        return
      }
      setConfirmPasswordError(false)
      setPasswordError(false)

      const data = { userId, token, password }

      const status = await UserService.activate(data)

      if (status === 200) {
        const signInResult = await UserService.signin({ email, password })

        if (signInResult.status === 200) {
          const _status = await UserService.deleteTokens(userId)

          if (_status === 200) {
            navigate('/')
          } else {
            helper.error()
          }
        } else {
          helper.error()
        }
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmPasswordKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const onLoad = async (user?: bookcarsTypes.User) => {
    if (user) {
      setNoMatch(true)
    } else {
      const params = new URLSearchParams(window.location.search)
      if (params.has('u') && params.has('e') && params.has('t')) {
        const _userId = params.get('u')
        const _email = params.get('e')
        const _token = params.get('t')
        if (_userId && _email && _token) {
          try {
            const status = await UserService.checkToken(_userId, _email, _token)

            if (status === 200) {
              setUserId(_userId)
              setEmail(_email)
              setToken(_token)
              setVisible(true)
            } else {
              setNoMatch(true)
            }
          } catch {
            setError(true)
          }
        } else {
          setNoMatch(true)
        }
      } else {
        setNoMatch(true)
      }
    }
  }

  return (
    <Layout onLoad={onLoad} strict={false}>
      <Seo title="Réinitialiser le mot de passe | Plany.tn" canonical="https://plany.tn/reset-password" robots="noindex,nofollow" />
      {visible && (
        <section className="auth-shell">
          <form
            className="auth-card auth-card--narrow reset-password-card"
            onSubmit={handleSubmit}
            aria-live="polite"
            aria-busy={submitting}
          >
            <h1 className="auth-title">{rpStrings.RESET_PASSWORD_HEADING}</h1>

            <FormControl fullWidth margin="dense">
              <InputLabel className="required" error={passwordError}>
                {cpStrings.NEW_PASSWORD}
              </InputLabel>
              <Input
                id="password-new"
                onChange={handleNewPasswordChange}
                type="password"
                value={password}
                error={passwordError}
                required
                disabled={submitting}
              />
              <FormHelperText error={passwordError}>{(passwordError && cpStrings.NEW_PASSWORD_ERROR) || ''}</FormHelperText>
            </FormControl>
            <FormControl fullWidth margin="dense" error={confirmPasswordError}>
              <InputLabel error={confirmPasswordError} className="required">
                {commonStrings.CONFIRM_PASSWORD}
              </InputLabel>
              <Input
                id="password-confirm"
                onChange={handleConfirmPasswordChange}
                onKeyDown={handleConfirmPasswordKeyDown}
                error={confirmPasswordError || passwordLengthError}
                type="password"
                value={confirmPassword}
                required
                disabled={submitting}
              />
              <FormHelperText error={confirmPasswordError || passwordLengthError}>
                {
                  (confirmPasswordError && commonStrings.PASSWORDS_DONT_MATCH)
                  || (passwordLengthError && commonStrings.PASSWORD_ERROR)
                  || ''
                }
              </FormHelperText>
            </FormControl>
            <div className="auth-actions">
              <Button
                type="submit"
                className="btn-primary"
                size="small"
                variant="contained"
                disabled={submitting}
              >
                {submitting ? commonStrings.PLEASE_WAIT : commonStrings.UPDATE}
              </Button>
              <Button className="btn-secondary" size="small" variant="contained" href="/" disabled={submitting}>
                {commonStrings.CANCEL}
              </Button>
            </div>
          </form>
        </section>
      )}
      {error && <Error />}
      {noMatch && <NoMatch hideHeader />}
    </Layout>
  )
}

export default ResetPassword
