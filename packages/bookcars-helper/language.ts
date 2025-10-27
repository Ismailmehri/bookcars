export interface NormalizeLanguageOptions {
  requestedLanguage: string | null | undefined
  storedLanguage: string | null | undefined
  availableLanguages: readonly string[]
  defaultLanguage: string
}

export const normalizeLanguage = ({
  requestedLanguage,
  storedLanguage,
  availableLanguages,
  defaultLanguage,
}: NormalizeLanguageOptions): string | null => {
  if (!requestedLanguage) {
    return null
  }

  if (availableLanguages.includes(requestedLanguage)) {
    return requestedLanguage
  }

  if (storedLanguage && availableLanguages.includes(storedLanguage)) {
    return storedLanguage
  }

  return defaultLanguage
}
