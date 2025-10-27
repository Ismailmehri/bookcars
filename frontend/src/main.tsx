import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { extendTheme } from '@mui/joy/styles'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { frFR as corefrFR, enUS as coreenUS, elGR as coreelGR } from '@mui/material/locale'
import { frFR, enUS, elGR } from '@mui/x-date-pickers/locales'
import { frFR as dataGridfrFR, enUS as dataGridenUS, elGR as dataGridelGR } from '@mui/x-data-grid/locales'
import { disableDevTools } from ':disable-react-devtools'
import { initializeLegacyPolyfills, normalizeLanguage, setCommissionConfig } from ':bookcars-helper'
import * as helper from '@/common/helper'
import * as UserService from '@/services/UserService'
import env from '@/config/env.config'
import App from '@/App'

import { strings as activateStrings } from '@/lang/activate'
import { strings as bookingStrings } from '@/lang/booking'
import { strings as bookingCarListStrings } from '@/lang/booking-car-list'
import { strings as bookingFilterStrings } from '@/lang/booking-filter'
import { strings as bookingListStrings } from '@/lang/booking-list'
import { strings as bookingsStrings } from '@/lang/bookings'
import { strings as carMultimediaFilterStrings } from '@/lang/car-multimedia-filter'
import { strings as carRangeFilterStrings } from '@/lang/car-range-filter'
import { strings as carRatingFilterStrings } from '@/lang/car-rating-filter'
import { strings as carsStrings } from '@/lang/cars'
import { strings as carSeatsFilterStrings } from '@/lang/car-seats-filter'
import { strings as carSpecsStrings } from '@/lang/car-specs'
import { strings as changePasswordStrings } from '@/lang/change-password'
import { strings as checkoutStrings } from '@/lang/checkout'
import { strings as commonStrings } from '@/lang/common'
import { strings as contactFormStrings } from '@/lang/contact-form'
import { strings as footerStrings } from '@/lang/footer'
import { strings as headerStrings } from '@/lang/header'
import { strings as homeStrings } from '@/lang/home'
import { strings as locationCarrouselStrings } from '@/lang/location-carrousel'
import { strings as mapStrings } from '@/lang/map'
import { strings as masterStrings } from '@/lang/master'
import { strings as noMatchStrings } from '@/lang/no-match'
import { strings as notificationsStrings } from '@/lang/notifications'
import { strings as resetPasswordStrings } from '@/lang/reset-password'
import { strings as searchSrings } from '@/lang/search'
import { strings as searchFormStrings } from '@/lang/search-form'
import { strings as settingsStrings } from '@/lang/settings'
import { strings as signInStrings } from '@/lang/sign-in'
import { strings as signUpStrings } from '@/lang/sign-up'
import { strings as tosStrings } from '@/lang/tos'

import 'github-fork-ribbon-css/gh-fork-ribbon.css'

import 'react-toastify/dist/ReactToastify.min.css'
import '@/assets/css/common.css'
import '@/assets/css/index.css'

initializeLegacyPolyfills()

const applyLanguage = (target: string) => {
  UserService.setLanguage(target)

  activateStrings.setLanguage(target)
  bookingStrings.setLanguage(target)
  bookingCarListStrings.setLanguage(target)
  bookingFilterStrings.setLanguage(target)
  bookingListStrings.setLanguage(target)
  bookingsStrings.setLanguage(target)
  carMultimediaFilterStrings.setLanguage(target)
  carRangeFilterStrings.setLanguage(target)
  carRatingFilterStrings.setLanguage(target)
  carsStrings.setLanguage(target)
  carSeatsFilterStrings.setLanguage(target)
  changePasswordStrings.setLanguage(target)
  checkoutStrings.setLanguage(target)
  commonStrings.setLanguage(target)
  contactFormStrings.setLanguage(target)
  footerStrings.setLanguage(target)
  headerStrings.setLanguage(target)
  homeStrings.setLanguage(target)
  locationCarrouselStrings.setLanguage(target)
  mapStrings.setLanguage(target)
  masterStrings.setLanguage(target)
  noMatchStrings.setLanguage(target)
  notificationsStrings.setLanguage(target)
  resetPasswordStrings.setLanguage(target)
  searchSrings.setLanguage(target)
  searchFormStrings.setLanguage(target)
  settingsStrings.setLanguage(target)
  signInStrings.setLanguage(target)
  signUpStrings.setLanguage(target)
  tosStrings.setLanguage(target)
  carSpecsStrings.setLanguage(target)
}

const renderApp = (language: string) => {
  const normalizedLanguage = language || env.DEFAULT_LANGUAGE
  const isFr = normalizedLanguage === 'fr'
  const isEL = normalizedLanguage === 'el'

  const theme = createTheme(
    {
      // palette: {
      //   primary: {
      //     main: '#1976D2',
      //     contrastText: '#121212',
      //     dark: '#1976D2',
      //   },
      // },
      typography: {
        fontFamily: [
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'Roboto',
          "'Helvetica Neue'",
          'Arial',
          'sans-serif',
          "'Apple Color Emoji'",
          "'Segoe UI Emoji'",
          "'Segoe UI Symbol'",
        ].join(','),
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: '#FAFAFA',
            },
          },
        },
        MuiFormControl: {
          styleOverrides: {
            root: {
              '& .Mui-disabled': {
                color: '#333 !important',
              },
            },
          },
        },
        MuiSwitch: {
          styleOverrides: {
            root: {
              '& .Mui-checked': {
                color: '#1976D2 !important',
              },
              '& .Mui-checked+.MuiSwitch-track': {
                opacity: 0.7,
                backgroundColor: '#1976D2 !important',
              },
            },
          },
        },
        MuiAutocomplete: {
          styleOverrides: {
            root: {
              '& .MuiAutocomplete-inputRoot': {
                paddingRight: '20px !important',
              },
            },
            listbox: {
              '& .Mui-focused': {
                backgroundColor: '#eee !important',
              },
            },
            option: {
              // Hover
              // '&[data-focus="true"]': {
              //     backgroundColor: '#eee !important',
              //     borderColor: 'transparent',
              // },
              // Selected
              '&[aria-selected="true"]': {
                backgroundColor: '#faad43 !important',
              },
            },
          },
        },
      },
    },
    isFr ? frFR : isEL ? elGR : enUS,
    isFr ? dataGridfrFR : isEL ? dataGridelGR : dataGridenUS,
    isFr ? corefrFR : isEL ? coreelGR : coreenUS,
  )

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <GoogleOAuthProvider clientId={env.GG_APP_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <App />
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover
            theme="dark"
          />
        </CssBaseline>
      </ThemeProvider>
    </GoogleOAuthProvider>,
  )
}

const bootstrap = async () => {
  if (env.isProduction) {
    disableDevTools()
  }

  setCommissionConfig({
    enabled: env.COMMISSION_ENABLED,
    rate: env.COMMISSION_RATE,
    effectiveDate: env.COMMISSION_EFFECTIVE_DATE,
    monthlyThreshold: env.COMMISSION_MONTHLY_THRESHOLD,
  })

  const user = JSON.parse(localStorage.getItem('bc-user') ?? 'null') as {
    id: string
    language: string
  } | null

  const requestedLanguage = UserService.getQueryLanguage()
  const normalizedLanguage = normalizeLanguage({
    requestedLanguage,
    storedLanguage: localStorage.getItem('bc-language'),
    availableLanguages: env.LANGUAGES,
    defaultLanguage: env.DEFAULT_LANGUAGE,
  })

  if (requestedLanguage && normalizedLanguage) {
    try {
      let nextLanguage = env.DEFAULT_LANGUAGE

      if (user) {
        nextLanguage = user.language
        if (normalizedLanguage.length === 2 && user.language !== normalizedLanguage) {
          const status = await UserService.validateAccessToken()

          if (status === 200) {
            const updateStatus = await UserService.updateLanguage({
              id: user.id,
              language: normalizedLanguage,
            })

            if (updateStatus !== 200) {
              helper.error(null, commonStrings.CHANGE_LANGUAGE_ERROR)
            }
          }

          nextLanguage = normalizedLanguage
        }
      } else {
        nextLanguage = normalizedLanguage
      }

      applyLanguage(nextLanguage)
    } catch (error) {
      helper.error(error, commonStrings.CHANGE_LANGUAGE_ERROR)
    }
  } else {
    let storedLang: string | undefined

    if (user && user.language) {
      storedLang = user.language
    } else {
      const slang = localStorage.getItem('bc-language')
      if (slang && slang.length === 2) {
        storedLang = slang
      }
    }

    if (env.SET_LANGUAGE_FROM_IP && !storedLang) {
      const country = await UserService.getCountryFromIP()

      if (country === 'France' || country === 'Morocco') {
        applyLanguage('fr')
      } else if (country === 'Greece') {
        applyLanguage('el')
      } else {
        applyLanguage(env.DEFAULT_LANGUAGE)
      }
    }
  }

  const language = UserService.getLanguage() || env.DEFAULT_LANGUAGE
  applyLanguage(language)
  renderApp(language)
}

bootstrap().catch((error) => {
  helper.error(error, commonStrings.CHANGE_LANGUAGE_ERROR)
  applyLanguage(env.DEFAULT_LANGUAGE)
  renderApp(env.DEFAULT_LANGUAGE)
})

const joyTheme = extendTheme({
  // Personnalisez le thème de Joy ici si nécessaire
})

export default joyTheme
