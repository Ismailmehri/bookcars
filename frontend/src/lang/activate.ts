import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    ACTIVATE_HEADING: 'Activation du compte',
    TOKEN_EXPIRED: "Votre lien d'activation du compte a expiré.",
    ACTIVATE: 'Activer',
    LINK_CHECKING: 'Vérification du lien en cours...',
    LINK_INVALID: 'Ce lien est invalide ou expiré.',
    LINK_READY: 'Votre lien est valide, vous pouvez définir votre mot de passe.',
  },
  en: {
    ACTIVATE_HEADING: 'Account Activation',
    TOKEN_EXPIRED: 'Your account activation link expired.',
    ACTIVATE: 'Activate',
    LINK_CHECKING: 'Checking your link...',
    LINK_INVALID: 'This link is invalid or expired.',
    LINK_READY: 'Your link is valid, you can set your password.',
  },
  es: {
    ACTIVATE_HEADING: 'Activación de la cuenta',
    TOKEN_EXPIRED: 'El enlace de activación de su cuenta ha expirado.',
    ACTIVATE: 'Activar',
    LINK_CHECKING: 'Verificando el enlace...',
    LINK_INVALID: 'Este enlace no es válido o ha caducado.',
    LINK_READY: 'Su enlace es válido, puede definir su contraseña.',
  },
})

langHelper.setLanguage(strings)
export { strings }
