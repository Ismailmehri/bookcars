import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

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
      } else if (status === 204) {
        setResend(true)
        setVisible(false)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
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
            const status = await UserService.checkToken(_userId, _email, _token)
            if (status === 200) {
              setUserId(_userId)
              setEmail(_email)
              setToken(_token)
              setVisible(true)
              if (params.has('r')) {
                const _reset = params.get('r') === 'true'
                setReset(_reset)
              }
            } else if (status === 204) {
              setEmail(_email)
              setResend(true)
            } else {
              setNoMatch(true)
            }
          } catch {
            setNoMatch(true)
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
      {resend && (
        <div className="flex justify-center py-8">
          <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded shadow">
            <h1 className="text-xl font-medium mb-4">{strings.ACTIVATE_HEADING}</h1>
            <div className="space-y-4">
              <span>{strings.TOKEN_EXPIRED}</span>
              <button type="button" className="px-4 py-2 bg-primary text-white rounded" onClick={handleResend}>
                {mStrings.RESEND}
              </button>
              <p className="text-center">
                <Link to="/" className="text-primary hover:underline">{commonStrings.GO_TO_HOME}</Link>
              </p>
            </div>
          </div>
        </div>
      )}
      {visible && (
        <div className="flex justify-center py-8">
          <form className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded shadow" onSubmit={handleSubmit}>
            <h1 className="text-xl font-medium mb-4">
              {reset ? rpStrings.RESET_PASSWORD_HEADING : strings.ACTIVATE_HEADING}
            </h1>
            <div className="mb-4">
              <label htmlFor="password-new" className="block mb-1 font-medium">{cpStrings.NEW_PASSWORD}</label>
              <input
                id="password-new"
                type="password"
                className={`w-full border rounded p-2 ${passwordError ? 'border-red-500' : ''}`}
                value={password}
                onChange={handleNewPasswordChange}
                required
              />
              {passwordError && (
                <div className="mt-1 text-sm text-red-600">{cpStrings.NEW_PASSWORD_ERROR}</div>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="password-confirm" className="block mb-1 font-medium">{commonStrings.CONFIRM_PASSWORD}</label>
              <input
                id="password-confirm"
                type="password"
                className={`w-full border rounded p-2 ${
                  confirmPasswordError || passwordLengthError ? 'border-red-500' : ''
                }`}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              {(confirmPasswordError || passwordLengthError) && (
                <div className="mt-1 text-sm text-red-600">
                  {confirmPasswordError ? commonStrings.PASSWORDS_DONT_MATCH : commonStrings.PASSWORD_ERROR}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
                {reset ? commonStrings.UPDATE : strings.ACTIVATE}
              </button>
              <a href="/" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
                {commonStrings.CANCEL}
              </a>
            </div>
          </form>
        </div>
      )}
      {noMatch && <NoMatch hideHeader />}
    </Layout>
  )
}

export default Activate
