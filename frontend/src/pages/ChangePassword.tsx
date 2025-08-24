import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Seo from '@/components/Seo'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/change-password'
import * as UserService from '@/services/UserService'
import Footer from '@/components/Footer'
import * as helper from '@/common/helper'

const ChangePassword = () => {
  const navigate = useNavigate()

  const [user, setUser] = useState<bookcarsTypes.User>()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPasswordError, setNewPasswordError] = useState(false)
  const [confirmPasswordError, setConfirmPasswordError] = useState(false)
  const [passwordLengthError, setPasswordLengthError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [currentPasswordError, setCurrentPasswordError] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value)
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value)
  }

  const error = () => {
    helper.error(null, strings.PASSWORD_UPDATE_ERROR)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()
      if (!user) {
        error()
        return
      }

      const submit = async () => {
        if (newPassword.length < 6) {
          setPasswordLengthError(true)
          setConfirmPasswordError(false)
          setNewPasswordError(false)
          return
        }
        setPasswordLengthError(false)
        setNewPasswordError(false)

        if (newPassword !== confirmPassword) {
          setConfirmPasswordError(true)
          setNewPasswordError(false)
          return
        }
        setConfirmPasswordError(false)
        setNewPasswordError(false)

        const _user = { ...user, password: newPassword }
        const status = await UserService.updatePassword(_user)
        if (status === 200) {
          navigate('/')
        } else {
          error()
        }
      }

      if (hasPassword) {
        const status = await UserService.checkPassword(currentPassword)
        if (status === 200) {
          submit()
        } else {
          setCurrentPasswordError(true)
        }
      } else {
        submit()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    if (!_user) {
      navigate('/')
      return
    }
    setUser(_user)
    setLoading(false)
    setHasPassword(!!_user.password)
  }

  return (
    <Layout onLoad={onLoad} strict>
      <Seo title={strings.CHANGE_PASSWORD} />
      {!loading && user && (
        <form className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow" onSubmit={handleSubmit}>
          {hasPassword && (
            <div className="mb-4">
              <label htmlFor="current-password" className="block mb-1 font-medium">{strings.CURRENT_PASSWORD}</label>
              <input
                id="current-password"
                type="password"
                className={`w-full border rounded p-2 ${currentPasswordError ? 'border-red-500' : ''}`}
                value={currentPassword}
                onChange={handleCurrentPasswordChange}
                required
              />
              {currentPasswordError && (
                <div className="mt-1 text-sm text-red-600">{strings.CURRENT_PASSWORD_ERROR}</div>
              )}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="new-password" className="block mb-1 font-medium">{strings.NEW_PASSWORD}</label>
            <input
              id="new-password"
              type="password"
              className={`w-full border rounded p-2 ${newPasswordError ? 'border-red-500' : ''}`}
              value={newPassword}
              onChange={handleNewPasswordChange}
              required
            />
            {passwordLengthError && (
              <div className="mt-1 text-sm text-red-600">{strings.PASSWORD_LENGTH}</div>
            )}
            {newPasswordError && (
              <div className="mt-1 text-sm text-red-600">{strings.NEW_PASSWORD_ERROR}</div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="confirm-password" className="block mb-1 font-medium">{commonStrings.CONFIRM_PASSWORD}</label>
            <input
              id="confirm-password"
              type="password"
              className={`w-full border rounded p-2 ${confirmPasswordError ? 'border-red-500' : ''}`}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
            {confirmPasswordError && (
              <div className="mt-1 text-sm text-red-600">{commonStrings.PASSWORDS_DONT_MATCH}</div>
            )}
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
              {strings.CHANGE_PASSWORD}
            </button>
          </div>
        </form>
      )}
      <Footer />
    </Layout>
  )
}

export default ChangePassword
