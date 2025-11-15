import crypto from 'node:crypto'

const sha256 = (value: string): string => crypto.createHash('sha256').update(value, 'utf8').digest('hex')

const removeDiacritics = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')

const normalizeForHash = (value: string): string => {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) {
    return ''
  }
  const withoutDiacritics = removeDiacritics(trimmed)
  return withoutDiacritics.replace(/[^a-z0-9]/g, '')
}

const hashNormalized = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined
  }
  const normalized = normalizeForHash(value)
  if (!normalized) {
    return undefined
  }
  return sha256(normalized)
}

export const hashEmail = (email?: string | null): string | undefined => hashNormalized(email)

const stripPhone = (value: string): string => value.replace(/[^0-9+]/g, '')

const ISO_TO_DIAL_CODE: Record<string, string> = {
  TN: '216',
  FR: '33',
  US: '1',
  CA: '1',
  ES: '34',
  DE: '49',
  IT: '39',
  GB: '44',
}

const removeLeadingZeros = (value: string): string => {
  if (value.startsWith('00')) {
    return value.slice(2)
  }
  return value
}

export const normalizePhoneToE164 = (phone?: string | null, countryDialCode?: string): string | undefined => {
  if (!phone) {
    return undefined
  }
  const trimmed = phone.trim()
  if (!trimmed) {
    return undefined
  }
  let cleaned = stripPhone(trimmed)
  if (!cleaned) {
    return undefined
  }
  if (cleaned.startsWith('+')) {
    return `+${removeLeadingZeros(cleaned.slice(1))}`
  }
  cleaned = removeLeadingZeros(cleaned)
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  const uppercaseCountry = countryDialCode?.trim().toUpperCase()
  const numericCountry = uppercaseCountry && ISO_TO_DIAL_CODE[uppercaseCountry]
    ? ISO_TO_DIAL_CODE[uppercaseCountry]
    : uppercaseCountry?.replace(/\D/g, '')
  if (numericCountry && !cleaned.startsWith(numericCountry)) {
    cleaned = `${numericCountry}${cleaned}`
  }
  if (!cleaned.startsWith('+')) {
    cleaned = `+${cleaned}`
  }
  return cleaned
}

export const hashPhone = (phone?: string | null, countryDialCode?: string): string | undefined => {
  const normalized = normalizePhoneToE164(phone, countryDialCode)
  if (!normalized) {
    return undefined
  }
  return sha256(normalized)
}

export const formatDob = (dob?: string | null): string | undefined => {
  if (!dob) {
    return undefined
  }
  const trimmed = dob.trim()
  if (!trimmed) {
    return undefined
  }
  const match = trimmed.match(/^(\d{4})(?:-|\/)?(\d{2})(?:-|\/)?(\d{2})$/)
  if (!match) {
    return undefined
  }
  const [, year, month, day] = match
  return `${year}${month}${day}`
}

export const sanitizeString = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed || undefined
}

export const sanitizeCountry = (value?: string | null): string | undefined => {
  const sanitized = sanitizeString(value)
  if (!sanitized) {
    return undefined
  }
  return sanitized.toUpperCase()
}

export const sanitizeGender = (value?: string | null): string | undefined => {
  const sanitized = sanitizeString(value)
  if (!sanitized) {
    return undefined
  }
  const normalized = sanitized.toLowerCase()
  if (['m', 'f', 'n'].includes(normalized)) {
    return normalized
  }
  return undefined
}

export const hashName = (value?: string | null): string | undefined => hashNormalized(value)

export const hashCity = (value?: string | null): string | undefined => hashNormalized(value)

export const hashState = (value?: string | null): string | undefined => hashNormalized(value)

export const hashPostalCode = (value?: string | null): string | undefined => hashNormalized(value)

export const hashCountry = (value?: string | null): string | undefined => hashNormalized(value)

export const hashExternalId = (value?: string | null): string | undefined => hashNormalized(value)

export { sha256 }
