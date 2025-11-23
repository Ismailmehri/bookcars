import React, { useState } from 'react'
import {
  FormControl,
  InputLabel,
  Input,
  Button,
  Link
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'
import * as bookcarsTypes from ':bookcars-types'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/sign-in'
import * as UserService from '@/services/UserService'
import Error from '@/components/Error'
import Layout from '@/components/Layout'
import SocialLogin from '@/components/SocialLogin'

import '@/assets/css/auth-forms.css'
import '@/assets/css/signin.css'

const SignIn = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [blacklisted, setBlacklisted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLElement>) => {
    try {
      e.preventDefault()

      setSubmitting(true)

      const data: bookcarsTypes.SignInPayload = {
        email,
        password,
        stayConnected: UserService.getStayConnected(),
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
          const redirect = params.get('redirect')
          if (redirect) {
            navigate(decodeURIComponent(redirect))
          } else {
            navigate(`/${window.location.search}`)
          }
        }
      } else {
        setError(true)
        setBlacklisted(false)
      }
    } catch {
      setError(true)
      setBlacklisted(false)
    } finally {
      setSubmitting(false)
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
      const redirect = params.get('redirect')
      if (redirect) {
        navigate(decodeURIComponent(redirect))
      } else {
        navigate(`/${window.location.search}`)
      }
    } else {
      setVisible(true)
    }
  }
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Se connecter - Plany.tn',
    description:
      'Connectez-vous à votre compte Plany.tn pour louer une voiture en Tunisie. Accédez à vos réservations et gérez vos informations personnelles.',
    url: 'https://plany.tn/sign-in',
    publisher: {
      '@type': 'Organization',
      name: 'Plany.tn',
      logo: {
        '@type': 'ImageObject',
        url: 'https://plany.tn/logo.png',
        width: 1200,
        height: 630,
      },
    },
  }
  const description = buildDescription(
    'Connectez-vous à votre compte Plany.tn pour louer une voiture en Tunisie. Accédez à vos réservations et gérez vos informations personnelles.'
  )

  return (
    <Layout strict={false} onLoad={onLoad}>
      <Seo
        title="Se connecter - Plany.tn"
        description={description}
        canonical="https://plany.tn/sign-in"
        robots="noindex,nofollow"
      />
      <Helmet>
        <meta charSet="utf-8" />
        {/* Balises Open Graph */}
        <meta property="og:title" content="Se connecter - Plany.tn" />
        <meta
          property="og:description"
          content="Connectez-vous à votre compte Plany.tn pour louer une voiture en Tunisie. Accédez à vos réservations et gérez vos informations personnelles."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://plany.tn/sign-in" />
        <meta property="og:image" content="https://plany.tn/logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Plany" />
        {/* Balises Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Se connecter - Plany.tn" />
        <meta
          name="twitter:description"
          content="Connectez-vous à votre compte Plany.tn pour louer une voiture en Tunisie. Accédez à vos réservations et gérez vos informations personnelles."
        />
        <meta name="twitter:image" content="https://plany.tn/logo.png" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
        {/* Données structurées */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      {visible && (
        <section className="auth-shell">
          <form
            className="auth-card auth-card--narrow signin-card"
            onSubmit={handleSubmit}
            aria-live="polite"
            aria-busy={submitting}
          >
            <h1 className="auth-title">{strings.SIGN_IN_HEADING}</h1>
            <p className="auth-subtitle">{strings.SIGN_IN_HEADING}</p>

            <FormControl fullWidth margin="dense">
              <InputLabel>{commonStrings.EMAIL}</InputLabel>
              <Input type="text" onChange={handleEmailChange} autoComplete="email" required disabled={submitting} />
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>{commonStrings.PASSWORD}</InputLabel>
              <Input
                onChange={handlePasswordChange}
                onKeyDown={handlePasswordKeyDown}
                autoComplete="password"
                type="password"
                required
                disabled={submitting}
              />
            </FormControl>

            <div className="stay-connected auth-inline">
              <input
                id="stay-connected"
                type="checkbox"
                disabled={submitting}
                onChange={(e) => {
                  UserService.setStayConnected(e.currentTarget.checked)
                }}
              />
              <label htmlFor="stay-connected">{strings.STAY_CONNECTED}</label>
            </div>

            <div className="auth-footer-links">
              <Link href="/forgot-password">{strings.RESET_PASSWORD}</Link>
              <Link href="/sign-up">{strings.SIGN_UP}</Link>
            </div>

            <SocialLogin />

            <div className="signin-actions">
              <Button
                variant="contained"
                size="small"
                href="/sign-up"
                className="btn-secondary"
                disabled={submitting}
              >
                {strings.SIGN_UP}
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="small"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? commonStrings.PLEASE_WAIT : strings.SIGN_IN}
              </Button>
            </div>

            <div className="signin-divider auth-divider" />

            <div className="signin-cta">
              <Button
                variant="contained"
                color="primary"
                size="large"
                href="https://admin.plany.tn/sign-up"
                disabled={submitting}
              >
                Inscrivez votre agence maintenant
              </Button>
            </div>

            <div className="auth-messages" role="status">
              {error && <Error message={strings.ERROR_IN_SIGN_IN} />}
              {blacklisted && <Error message={strings.IS_BLACKLISTED} />}
            </div>
          </form>
        </section>
      )}
    </Layout>
  )
}

export default SignIn
