export const MIN_SUBJECT_LENGTH = 3
export const MIN_MESSAGE_LENGTH = 10

export interface ContactFormState {
  emailValid: boolean
  subject: string
  message: string
  sending: boolean
  recaptchaToken?: string
}

export const isSubjectValid = (subject: string): boolean => subject.trim().length >= MIN_SUBJECT_LENGTH

export const isMessageValid = (message: string): boolean => message.trim().length >= MIN_MESSAGE_LENGTH

export const canSubmitContact = (state: ContactFormState): boolean => {
  if (state.sending) {
    return false
  }

  if (!state.emailValid) {
    return false
  }

  const subjectOk = isSubjectValid(state.subject)
  const messageOk = isMessageValid(state.message)
  const hasToken = Boolean(state.recaptchaToken && state.recaptchaToken.trim())

  return subjectOk && messageOk && hasToken
}

export const sanitizeContactMessage = (message: string): string => message.replace(/\s+/g, ' ').trim()
