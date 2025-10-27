import React from 'react'
import ReactDOM from 'react-dom/client'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ToastContainer } from 'react-toastify'

import { frFR as corefrFR, enUS as coreenUS } from '@mui/material/locale'
import { frFR, enUS } from '@mui/x-date-pickers/locales'
import { frFR as dataGridfrFR, enUS as dataGridenUS } from '@mui/x-data-grid/locales'
import { disableDevTools } from ':disable-react-devtools'
import { initializeLegacyPolyfills, normalizeLanguage, setCommissionConfig } from ':bookcars-helper'
import * as helper from '@/common/helper'
import * as UserService from '@/services/UserService'
import { strings as commonStrings } from '@/lang/common'
import env from '@/config/env.config'
import App from '@/App'

import 'react-toastify/dist/ReactToastify.min.css'
import '@/assets/css/common.css'
import '@/assets/css/index.css'

initializeLegacyPolyfills()

const renderApp = (language: string) => {
  const normalizedLanguage = language || env.DEFAULT_LANGUAGE
  const isFr = normalizedLanguage === 'fr'

  const theme = createTheme(
    {
      typography: {
        fontFamily: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ].join(','),
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: '#fafafa',
            },
          },
        },
      },
    },
    isFr ? frFR : enUS,
    isFr ? dataGridfrFR : dataGridenUS,
    isFr ? corefrFR : coreenUS,
  )

  ReactDOM.createRoot(document.getElementById('root')!).render(
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
    </ThemeProvider>,
  )
}

const bootstrap = async () => {
  if (import.meta.env.VITE_NODE_ENV === 'production') {
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
      let language = env.DEFAULT_LANGUAGE

      if (user) {
        language = user.language
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

          language = normalizedLanguage
        }
      } else {
        language = normalizedLanguage
      }

      UserService.setLanguage(language)
      commonStrings.setLanguage(language)
    } catch (error) {
      helper.error(error, commonStrings.CHANGE_LANGUAGE_ERROR)
    }
  }

  const language = UserService.getLanguage() || env.DEFAULT_LANGUAGE
  renderApp(language)
}

bootstrap().catch((error) => {
  helper.error(error, commonStrings.CHANGE_LANGUAGE_ERROR)
  renderApp(env.DEFAULT_LANGUAGE)
})
