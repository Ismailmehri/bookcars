import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    RESET_PASSWORD_HEADING: 'Réinitialisation du mot de passe',
    RESET_PASSWORD: 'Veuillez saisir votre adresse e-mail afin de vous envoyer un e-mail pour réinitialiser votre mot de passe.',
    EMAIL_ERROR: 'Adresse e-mail non enregistrée',
    RESET: 'Réinitialiser',
    EMAIL_SENT: 'E-mail de réinitialisation du mot de passe envoyé.',
    LINK_CHECKING: 'Vérification du lien de réinitialisation...',
    LINK_INVALID: 'Le lien est invalide ou expiré.',
    LINK_READY: 'Lien vérifié, vous pouvez réinitialiser votre mot de passe.',
  },
  en: {
    RESET_PASSWORD_HEADING: 'Password Reset',
    RESET_PASSWORD: 'Please enter your email address so we can send you an email to reset your password.',
    EMAIL_ERROR: 'Email address not registered',
    RESET: 'Reset',
    EMAIL_SENT: 'Password reset email sent.',
    LINK_CHECKING: 'Checking the reset link...',
    LINK_INVALID: 'This link is invalid or expired.',
    LINK_READY: 'Link verified, you can reset your password.',
  },
})

langHelper.setLanguage(strings)
export { strings }
