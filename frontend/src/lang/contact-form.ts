import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    CONTACT_HEADING: 'Contact',
    SUBJECT: 'Objet',
    MESSAGE: 'Message',
    SEND: 'Envoyer',
    MESSAGE_SENT: 'Message envoyé',
    SUBJECT_HELP: 'Ajoutez un objet clair pour accélérer la prise en charge.',
    MESSAGE_HELP: 'Détaillez votre besoin (minimum 10 caractères).',
    RECAPTCHA_DISABLED: 'Le formulaire est momentanément indisponible. Merci de réessayer plus tard.',
  },
  en: {
    CONTACT_HEADING: 'Contact',
    SUBJECT: 'Subject',
    MESSAGE: 'Message',
    SEND: 'Send',
    MESSAGE_SENT: 'Message sent',
    SUBJECT_HELP: 'Add a clear subject so we can help faster.',
    MESSAGE_HELP: 'Describe your request (minimum 10 characters).',
    RECAPTCHA_DISABLED: 'The form is temporarily unavailable. Please try again later.',
  },
  el: {
    CONTACT_HEADING: 'Επικοινωνία',
    SUBJECT: 'Θέμα',
    MESSAGE: 'Μήνυμα',
    SEND: 'Στείλετε',
    MESSAGE_SENT: 'Το μήνυμα στάλθηκε',
    SUBJECT_HELP: 'Προσθέστε σαφές θέμα για ταχύτερη εξυπηρέτηση.',
    MESSAGE_HELP: 'Περιγράψτε το αίτημά σας (τουλάχιστον 10 χαρακτήρες).',
    RECAPTCHA_DISABLED: 'Η φόρμα δεν είναι διαθέσιμη προσωρινά. Δοκιμάστε ξανά αργότερα.',
  },
  es: {
    CONTACT_HEADING: 'Contacto',
    SUBJECT: 'Asunto',
    MESSAGE: 'Mensaje',
    SEND: 'Enviar',
    MESSAGE_SENT: 'Mensaje enviado',
    SUBJECT_HELP: 'Añade un asunto claro para ayudarte más rápido.',
    MESSAGE_HELP: 'Describe tu necesidad (mínimo 10 caracteres).',
    RECAPTCHA_DISABLED: 'El formulario no está disponible temporalmente. Inténtalo de nuevo más tarde.',
  },
})

langHelper.setLanguage(strings)
export { strings }
