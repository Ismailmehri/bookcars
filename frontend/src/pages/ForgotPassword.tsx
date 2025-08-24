import React, { useState } from 'react'
import validator from 'validator'
import Seo from '@/components/Seo'
import * as bookcarsTypes from ':bookcars-types'
import * as UserService from '@/services/UserService'
import * as helper from '@/common/helper'
import Layout from '@/components/Layout'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/reset-password'
import SocialLogin from '@/components/SocialLogin'
import NoMatch from './NoMatch'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState(false)
  const [emailValid, setEmailValid] = useState(true)
  const [noMatch, setNoMatch] = useState(false)
  const [sent, setSent] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)

    if (!e.target.value) {
      setError(false)
      setEmailValid(true)
    }
  }

  const validateEmail = async (_email: string) => {
    if (_email) {
      if (validator.isEmail(_email)) {
        try {
          const status = await UserService.validateEmail({ email: _email })

          if (status === 200) {
            // user not found (error)
            setError(true)
            setEmailValid(true)
            return false
          }
          setError(false)
          setEmailValid(true)
          return true
        } catch (err) {
          helper.error(err)
          setError(false)
          setEmailValid(true)
          return false
        }
      } else {
        setError(false)
        setEmailValid(false)
        return false
      }
    } else {
      setError(false)
      setEmailValid(true)
      return false
    }
  }

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await validateEmail(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLElement>) => {
    try {
      e.preventDefault()

      const _emailValid = await validateEmail(email)
      if (!_emailValid) {
        return
      }

      const status = await UserService.resend(email, true)
      if (status === 200) {
        setError(false)
        setEmailValid(true)
        setSent(true)
      } else {
        setError(true)
        setEmailValid(true)
      }
    } catch {
      setError(true)
      setEmailValid(true)
    }
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const onLoad = (user?: bookcarsTypes.User) => {
    if (user) {
      setNoMatch(true)
    } else {
      setVisible(true)
    }
  }

  return (
    <Layout onLoad={onLoad} strict={false}>
      <Seo title="Mot de passe oublié | Plany.tn" canonical="https://plany.tn/forgot-password" robots="noindex,nofollow" />
      {visible && (
        <div className="flex justify-center my-11">
          <div className="mt-10 w-[330px] md:w-[450px] p-8 rounded-lg shadow bg-white">
            <h1 className="text-center text-xl font-bold mb-4">
              {strings.RESET_PASSWORD_HEADING}
            </h1>
            {sent && (
              <div className="text-center">
                <span>{strings.EMAIL_SENT}</span>
                <p>
                  <a href="/" className="text-primary hover:underline">
                    {commonStrings.GO_TO_HOME}
                  </a>
                </p>
              </div>
            )}
            {!sent && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <span>{strings.RESET_PASSWORD}</span>
                <label htmlFor="email" className="flex flex-col text-sm font-medium">
                  {commonStrings.EMAIL}
                  <input
                    id="email"
                    type="text"
                    onChange={handleEmailChange}
                    onKeyDown={handleEmailKeyDown}
                    onBlur={handleEmailBlur}
                    autoComplete="off"
                    required
                    className={`mt-1 rounded border p-2 ${
                      error || !emailValid ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {(!emailValid && (
                    <span className="text-xs text-red-500">
                      {commonStrings.EMAIL_NOT_VALID}
                    </span>
                  ))
                    || (error && (
                      <span className="text-xs text-red-500">
                        {strings.EMAIL_ERROR}
                      </span>
                    ))}
                </label>

                <SocialLogin />

                <div className="flex gap-2 justify-center mt-5">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
                  >
                    {strings.RESET}
                  </button>
                  <a
                    href="/"
                    className="px-4 py-2 rounded bg-secondary text-white hover:bg-secondary/90 text-center"
                  >
                    {commonStrings.CANCEL}
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {noMatch && <NoMatch hideHeader />}
    </Layout>
  )
}

export default ForgotPassword
