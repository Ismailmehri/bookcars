import React, { useState } from 'react'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper
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
import Backdrop from '@/components/SimpleBackdrop'
import { TokenState, canSubmitPasswords, resolveTokenState, validatePasswords } from './auth.utils'

import '@/assets/css/reset-password.css'
import '@/assets/css/auth-status.css'

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
  const [tokenState, setTokenState] = useState<TokenState>('checking')
  const [busy, setBusy] = useState(false)

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLElement>) => {
    try {
      e.preventDefault()
      const validation = validatePasswords(password, confirmPassword)
      setPasswordError(validation.tooShort)
      setPasswordLengthError(validation.tooShort)
      setConfirmPasswordError(validation.mismatch)

      if (!canSubmitPasswords(validation, busy) || tokenState !== 'ready') {
        return
      }

      setBusy(true)

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

      setBusy(false)
    } catch (err) {
      helper.error(err)
      setBusy(false)
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
            setTokenState('checking')
            const status = await UserService.checkToken(_userId, _email, _token)
            const nextState = resolveTokenState(status)

            if (nextState === 'ready') {
              setUserId(_userId)
              setEmail(_email)
              setToken(_token)
              setVisible(true)
              setTokenState(nextState)
            } else {
              setNoMatch(true)
              setTokenState('invalid')
            }
          } catch {
            setError(true)
            setTokenState('invalid')
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
      {tokenState !== 'ready' && !noMatch && (
        <div className="auth-status" data-variant={tokenState === 'invalid' ? 'error' : 'info'} role="status" aria-live="polite">
          <span className="status-indicator" aria-hidden />
          <span>{tokenState === 'checking' ? rpStrings.LINK_CHECKING : rpStrings.LINK_INVALID}</span>
        </div>
      )}
      {visible && (
        <div className="reset-password">
          <div className="auth-status" data-variant="success" role="status" aria-live="polite">
            <span className="status-indicator" aria-hidden />
            <span>{rpStrings.LINK_READY}</span>
          </div>
          <Paper className="reset-password-form" elevation={10}>
            <h1>{rpStrings.RESET_PASSWORD_HEADING}</h1>
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth margin="dense">
                <InputLabel className="required" error={passwordError}>
                  {cpStrings.NEW_PASSWORD}
                </InputLabel>
                <Input id="password-new" onChange={handleNewPasswordChange} type="password" value={password} error={passwordError} required />
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
                />
                <FormHelperText error={confirmPasswordError || passwordLengthError}>
                  {
                    (confirmPasswordError && commonStrings.PASSWORDS_DONT_MATCH)
                    || (passwordLengthError && commonStrings.PASSWORD_ERROR)
                    || ''
                  }
                </FormHelperText>
              </FormControl>
              <div className="reset-password-buttons">
                <Button
                  type="submit"
                  className="btn-primary btn-margin btn-margin-bottom"
                  size="small"
                  variant="contained"
                  disabled={!canSubmitPasswords(validatePasswords(password, confirmPassword), busy) || tokenState !== 'ready'}
                >
                  {commonStrings.UPDATE}
                </Button>
                <Button className="btn-secondary btn-margin-bottom" size="small" variant="contained" href="/">
                  {commonStrings.CANCEL}
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      )}
      {error && <Error />}
      {noMatch && <NoMatch hideHeader />}
      {(tokenState === 'checking' || busy) && <Backdrop text={rpStrings.LINK_CHECKING} />}
    </Layout>
  )
}

export default ResetPassword
