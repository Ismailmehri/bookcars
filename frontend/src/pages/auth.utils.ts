export type TokenState = 'checking' | 'ready' | 'expired' | 'invalid'

export type PasswordValidation = {
  tooShort: boolean
  mismatch: boolean
}

export const MIN_PASSWORD_LENGTH = 6

export const validatePasswords = (password: string, confirm?: string): PasswordValidation => {
  const trimmedPassword = password.trim()
  const hasConfirm = typeof confirm === 'string'

  return {
    tooShort: trimmedPassword.length < MIN_PASSWORD_LENGTH,
    mismatch: hasConfirm ? trimmedPassword !== confirm : false,
  }
}

export const canSubmitPasswords = (validation: PasswordValidation, busy = false) =>
  !busy && !validation.tooShort && !validation.mismatch

export const resolveTokenState = (status?: number | null): TokenState => {
  if (status === 200) {
    return 'ready'
  }

  if (status === 204) {
    return 'expired'
  }

  if (status === 400 || status === 404) {
    return 'invalid'
  }

  return 'checking'
}

export const canSendEmail = (emailValid: boolean, hasEmail: boolean, busy = false) =>
  emailValid && hasEmail && !busy
