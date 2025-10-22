import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    SIGN_IN_HEADING: 'Connexion',
    SIGN_IN: 'Se connecter',
    SIGN_UP: "S'inscrire",
    ERROR_IN_SIGN_IN_TITLE: 'Connexion impossible.',
    ERROR_IN_SIGN_IN_HELP: 'Votre email ou mot de passe est incorrect',
    IS_BLACKLISTED_TITLE: 'Votre compte est suspendu.',
    IS_BLACKLISTED_HELP: 'Pour obtenir plus d’informations, contactez notre équipe à l’adresse',
    SUPPORT_EMAIL: 'contact@plany.tn',
    RESET_PASSWORD: 'Mot de passe oublié ?',
    STAY_CONNECTED: 'Rester connecté',
  },
  en: {
    SIGN_IN_HEADING: 'Sign in',
    SIGN_UP: "S'inscrire",
    SIGN_IN: 'Sign in',
    ERROR_IN_SIGN_IN_TITLE: 'Unable to sign in.',
    ERROR_IN_SIGN_IN_HELP: 'Please double-check your credentials or reach out to our team at',
    IS_BLACKLISTED_TITLE: 'Your account is suspended.',
    IS_BLACKLISTED_HELP: 'For more information, reach out to our team at',
    SUPPORT_EMAIL: 'contact@plany.tn',
    RESET_PASSWORD: 'Forgot password?',
    STAY_CONNECTED: 'Stay connected',
  },
})

langHelper.setLanguage(strings)
export { strings }
