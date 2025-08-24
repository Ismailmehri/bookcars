import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Seo from '@/components/Seo'
import * as UserService from '@/services/UserService'
import Layout from '@/components/Layout'
import { strings as commonStrings } from '@/lang/common'
import { strings as cpStrings } from '@/lang/change-password'
import { strings as rpStrings } from '@/lang/reset-password'
import Error from './Error'
import NoMatch from './NoMatch'
import * as helper from '@/common/helper'

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
            setError(true)
          }
        } else {
          helper.error()
          setError(true)
        }
      } else {
        helper.error()
        setError(true)
      }
    } catch (err) {
      helper.error(err)
      setError(true)
    }
  }

  const onLoad = async () => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('u') && params.has('e') && params.has('t')) {
      const _userId = params.get('u')
      const _email = params.get('e')
      const _token = params.get('t')
      if (_userId && _email && _token) {
        setUserId(_userId)
        setEmail(_email)
        setToken(_token)
        setVisible(true)
      } else {
        setNoMatch(true)
      }
    } else {
      setNoMatch(true)
    }
  }

  return (
    <Layout onLoad={onLoad} strict={false}>
      <Seo title="Réinitialiser le mot de passe | Plany.tn" canonical="https://plany.tn/reset-password" robots="noindex,nofollow" />
      {visible && (
        <form className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow" onSubmit={handleSubmit}>
          <h1 className="text-xl font-medium mb-4">{rpStrings.RESET_PASSWORD_HEADING}</h1>
          <div className="mb-4">
            <label htmlFor="rp-password" className="block mb-1 font-medium">{cpStrings.NEW_PASSWORD}</label>
            <input
              id="rp-password"
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
            <label htmlFor="rp-confirm" className="block mb-1 font-medium">{commonStrings.CONFIRM_PASSWORD}</label>
            <input
              id="rp-confirm"
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
              {commonStrings.SUBMIT}
            </button>
            <a href="/" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
              {commonStrings.CANCEL}
            </a>
          </div>
        </form>
      )}
      {noMatch && <NoMatch />}
      {error && <Error />}
    </Layout>
  )
}

export default ResetPassword
