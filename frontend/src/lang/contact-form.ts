import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    CONTACT_HEADING: 'Contact',
    CTA: 'Nous répondons rapidement à toutes vos questions mobilité.',
    SUBJECT: 'Objet',
    MESSAGE: 'Message',
    SEND: 'Envoyer',
    MESSAGE_SENT: 'Message envoyé',
    EMPTY_STATE: 'Merci de renseigner l\'objet et le message pour continuer.',
    RECAPTCHA_DISABLED: 'Protection anti-robot indisponible pour le moment. Contactez-nous par e-mail.',
  },
  en: {
    CONTACT_HEADING: 'Contact',
    CTA: 'We reply quickly to every mobility question.',
    SUBJECT: 'Subject',
    MESSAGE: 'Message',
    SEND: 'Send',
    MESSAGE_SENT: 'Message sent',
    EMPTY_STATE: 'Please provide a subject and message to continue.',
    RECAPTCHA_DISABLED: 'Anti-bot protection is unavailable. Please reach out via email.',
  },
  el: {
    CONTACT_HEADING: 'Επικοινωνία',
    CTA: 'Απαντάμε άμεσα σε κάθε απορία μετακίνησης.',
    SUBJECT: 'Θέμα',
    MESSAGE: 'Μήνυμα',
    SEND: 'Στείλετε',
    MESSAGE_SENT: 'Το μήνυμα στάλθηκε',
    EMPTY_STATE: 'Συμπληρώστε θέμα και μήνυμα για να συνεχίσετε.',
    RECAPTCHA_DISABLED: 'Η προστασία bot δεν είναι διαθέσιμη. Επικοινωνήστε μέσω email.',
  },
  es: {
    CONTACT_HEADING: 'Contacto',
    CTA: 'Respondemos rápido a cualquier duda sobre movilidad.',
    SUBJECT: 'Asunto',
    MESSAGE: 'Mensaje',
    SEND: 'Enviar',
    MESSAGE_SENT: 'Mensaje enviado',
    EMPTY_STATE: 'Indique asunto y mensaje para continuar.',
    RECAPTCHA_DISABLED: 'Protección anti-bot no disponible. Contáctenos por email.',
  },
})

langHelper.setLanguage(strings)
export { strings }
