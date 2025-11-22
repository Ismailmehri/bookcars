import React, { useState } from 'react'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Link
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Seo from '@/components/Seo'
import * as bookcarsTypes from ':bookcars-types'
import * as UserService from '@/services/UserService'
import Layout from '@/components/Layout'
import { strings as commonStrings } from '@/lang/common'
import { strings as cpStrings } from '@/lang/change-password'
import { strings as rpStrings } from '@/lang/reset-password'
import { strings as mStrings } from '@/lang/master'
import { strings } from '@/lang/activate'
import NoMatch from './NoMatch'
import * as helper from '@/common/helper'
import Backdrop from '@/components/SimpleBackdrop'
import { TokenState, canSubmitPasswords, resolveTokenState, validatePasswords } from './auth.utils'

import '@/assets/css/activate.css'
import '@/assets/css/auth-status.css'

const Activate = () => {
  const navigate = useNavigate()
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [visible, setVisible] = useState(false)
  const [resend, setResend] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [confirmPasswordError, setConfirmPasswordError] = useState(false)
  const [passwordLengthError, setPasswordLengthError] = useState(false)
  const [reset, setReset] = useState(false)
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

      const data: bookcarsTypes.ActivatePayload = { userId, token, password }

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

  const handleResend = async () => {
    try {
      const status = await UserService.resend(email, false)

      if (status === 200) {
        helper.info(commonStrings.ACTIVATION_EMAIL_SENT)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
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

              if (params.has('r')) {
                const _reset = params.get('r') === 'true'
                setReset(_reset)
              }
            } else if (nextState === 'expired') {
              setEmail(_email)
              setResend(true)
              setTokenState(nextState)
            } else {
              setNoMatch(true)
              setTokenState('invalid')
            }
          } catch {
            setNoMatch(true)
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
      <Seo title="Activation du compte | Plany.tn" canonical="https://plany.tn/activate" robots="noindex,nofollow" />
      {tokenState !== 'ready' && !noMatch && (
        <div className="auth-status" data-variant={tokenState === 'invalid' ? 'error' : 'info'} role="status" aria-live="polite">
          <span className="status-indicator" aria-hidden />
          <span>{tokenState === 'checking' ? strings.LINK_CHECKING : strings.LINK_INVALID}</span>
        </div>
      )}
      {resend && (
        <div className="resend">
          <Paper className="resend-form" elevation={10}>
            <h1>{strings.ACTIVATE_HEADING}</h1>
            <div className="resend-form-content">
              <span>{strings.TOKEN_EXPIRED}</span>
              <Button type="button" variant="contained" size="small" className="btn-primary btn-resend" onClick={handleResend}>
                {mStrings.RESEND}
              </Button>
              <p className="go-to-home">
                <Link href="/">{commonStrings.GO_TO_HOME}</Link>
              </p>
            </div>
          </Paper>
        </div>
      )}
      {visible && (
        <div className="activate">
          <div className="auth-status" data-variant="success" role="status" aria-live="polite">
            <span className="status-indicator" aria-hidden />
            <span>{strings.LINK_READY}</span>
          </div>
          <Paper className="activate-form" elevation={10}>
            <h1>{reset ? rpStrings.RESET_PASSWORD_HEADING : strings.ACTIVATE_HEADING}</h1>
            <form onSubmit={handleSubmit}>
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
                />
                <FormHelperText error={confirmPasswordError || passwordLengthError}>
                  {
                    (confirmPasswordError && commonStrings.PASSWORDS_DONT_MATCH)
                    || (passwordLengthError && commonStrings.PASSWORD_ERROR)
                    || ''
                  }
                </FormHelperText>
              </FormControl>
              <div className="buttons">
                <Button
                  type="submit"
                  className="btn-primary btn-margin btn-margin-bottom"
                  size="small"
                  variant="contained"
                  disabled={!canSubmitPasswords(validatePasswords(password, confirmPassword), busy) || tokenState !== 'ready'}
                >
                  {reset ? commonStrings.UPDATE : strings.ACTIVATE}
                </Button>
                <Button className="btn-secondary btn-margin-bottom" size="small" variant="contained" href="/">
                  {commonStrings.CANCEL}
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      )}
      {noMatch && <NoMatch hideHeader />}
      {(tokenState === 'checking' || busy) && <Backdrop text={strings.LINK_CHECKING} />}
    </Layout>
  )
}

export default Activate
