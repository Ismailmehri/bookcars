import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    SIGN_UP_HEADING: 'Inscription',
    SIGN_UP: "S'inscrire",
    SIGN_UP_ERROR: "Une erreur s'est produite lors de l'inscription.",
    AGENCY_SIGNUP_INFO: 'Vous êtes une agence ? Accédez à la plateforme dédiée.',
    AGENCY_SIGNUP_BUTTON: 'Inscrire mon agence',
  },
  en: {
    SIGN_UP_HEADING: 'Sign up',
    SIGN_UP: 'Sign up',
    SIGN_UP_ERROR: 'An error occurred during sign up.',
    AGENCY_SIGNUP_INFO: 'Are you an agency? Switch to the dedicated portal.',
    AGENCY_SIGNUP_BUTTON: 'Register as an agency',
  },
})

langHelper.setLanguage(strings)
export { strings }
