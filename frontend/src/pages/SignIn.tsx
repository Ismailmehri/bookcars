import React, { useState } from 'react'
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
        <div className="flex flex-col items-center py-12">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h1 className="text-center text-2xl font-semibold text-gray-800">{strings.SIGN_IN_HEADING}</h1>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{commonStrings.EMAIL}</label>
                <input
                  id="email"
                  type="email"
                  onChange={handleEmailChange}
                  autoComplete="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">{commonStrings.PASSWORD}</label>
                <input
                  id="password"
                  type="password"
                  onChange={handlePasswordChange}
                  onKeyDown={handlePasswordKeyDown}
                  autoComplete="password"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="stay-connected"
                  type="checkbox"
                  onChange={(e) => {
                    UserService.setStayConnected(e.currentTarget.checked)
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="stay-connected" className="ml-2 block cursor-pointer select-none text-sm text-gray-600">
                  {strings.STAY_CONNECTED}
                </label>
              </div>

              <div className="text-right">
                <a href="/forgot-password" className="text-sm text-primary hover:underline">
                  {strings.RESET_PASSWORD}
                </a>
              </div>

              <SocialLogin />

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href="/sign-up"
                  className="inline-flex justify-center rounded-md bg-secondary px-4 py-2 text-white hover:bg-secondary/90"
                >
                  {strings.SIGN_UP}
                </a>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
                >
                  {strings.SIGN_IN}
                </button>
              </div>

              <div className="my-6 border-t border-gray-200" />

              <div className="text-center">
                <a
                  href="https://admin.plany.tn/sign-up"
                  className="inline-block rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-lg font-medium text-white shadow-md hover:shadow-lg transition"
                >
                  Inscrivez votre agence maintenant
                </a>
              </div>

              <div className="h-16 pt-2 text-center">
                {error && <Error message={strings.ERROR_IN_SIGN_IN} />}
                {blacklisted && <Error message={strings.IS_BLACKLISTED} />}
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default SignIn
