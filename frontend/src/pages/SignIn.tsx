import React, { useState } from 'react'
import {
  Paper,
  FormControl,
  InputLabel,
  Input,
  Button,
  Link
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import * as bookcarsTypes from ':bookcars-types'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/sign-in'
import * as UserService from '@/services/UserService'
import Error from '@/components/Error'
import Layout from '@/components/Layout'
import SocialLogin from '@/components/SocialLogin'

import '@/assets/css/signin.css'

const SignIn = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [blacklisted, setBlacklisted] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLElement>) => {
    try {
      e.preventDefault()

      const data: bookcarsTypes.SignInPayload = {
        email,
        password,
        stayConnected: UserService.getStayConnected()
      }

      const res = await UserService.signin(data)
      if (res.status === 200) {
        if (res.data.blacklisted) {
          await UserService.signout(false)
          setError(false)
          setBlacklisted(true)
        } else {
          setError(false)

          const params = new URLSearchParams(window.location.search)
          if (params.has('from')) {
            const from = params.get('from')
            if (from === 'checkout') {
              navigate(`/checkout${window.location.search}`)
            } else {
              navigate(0)
            }
          } else {
            navigate(0)
          }
        }
      } else {
        setError(true)
        setBlacklisted(false)
      }
    } catch {
      setError(true)
      setBlacklisted(false)
    }
  }

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const onLoad = async (user?: bookcarsTypes.User) => {
    UserService.setStayConnected(false)

    if (user) {
      const params = new URLSearchParams(window.location.search)
      if (params.has('from')) {
        const from = params.get('from')
        if (from === 'checkout') {
          navigate(`/checkout${window.location.search}`)
        } else {
          navigate(`/${window.location.search}`)
        }
      } else {
        navigate(`/${window.location.search}`)
      }
    } else {
      setVisible(true)
    }
  }

  return (
    <Layout strict={false} onLoad={onLoad}>
      {visible && (
        <div className="signin">
          <Paper className="signin-form" elevation={10}>
            <form onSubmit={handleSubmit}>
              <h1 className="signin-form-title">{strings.SIGN_IN_HEADING}</h1>
              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.EMAIL}</InputLabel>
                <Input type="text" onChange={handleEmailChange} autoComplete="email" required />
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.PASSWORD}</InputLabel>
                <Input onChange={handlePasswordChange} onKeyDown={handlePasswordKeyDown} autoComplete="password" type="password" required />
              </FormControl>

              <div className="stay-connected">
                <input
                  id="stay-connected"
                  type="checkbox"
                  onChange={(e) => {
                    UserService.setStayConnected(e.currentTarget.checked)
                  }}
                />
                <label
                  htmlFor="stay-connected"
                >
                  {strings.STAY_CONNECTED}
                </label>
              </div>

              <div className="forgot-password">
                <Link href="/forgot-password">{strings.RESET_PASSWORD}</Link>
              </div>

              <SocialLogin />

              <div className="signin-buttons">
                <Button variant="contained" size="small" href="/sign-up" className="btn-secondary btn-margin btn-margin-bottom">
                  {strings.SIGN_UP}
                </Button>
                <Button type="submit" variant="contained" size="small" className="btn-primary btn-margin btn-margin-bottom">
                  {strings.SIGN_IN}
                </Button>
              </div>
              <div className="separator" />
              <div className="signin-button">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  href="https://admin.plany.tn/sign-up"
                  sx={{ padding: '10px 20px', fontSize: '16px', borderRadius: '10px' }}
                >
                  Inscrivez votre agence maintenant
                </Button>
              </div>
              <div className="form-error">
                {error && <Error message={strings.ERROR_IN_SIGN_IN} />}
                {blacklisted && <Error message={strings.IS_BLACKLISTED} />}
              </div>
            </form>
          </Paper>
        </div>
      )}
    </Layout>
  )
}

export default SignIn
