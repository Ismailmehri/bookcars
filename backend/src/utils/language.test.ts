import { describe, expect, it } from 'vitest'

import { normalizeLanguage } from ':bookcars-helper'

describe('normalizeLanguage', () => {
  const languages = ['en', 'fr', 'el']
  const defaultLanguage = 'en'

  it('returns the requested language when it is supported', () => {
    const language = normalizeLanguage({
      requestedLanguage: 'fr',
      storedLanguage: null,
      availableLanguages: languages,
      defaultLanguage,
    })

    expect(language).toBe('fr')
  })

  it('falls back to the stored language when the requested language is not supported', () => {
    const language = normalizeLanguage({
      requestedLanguage: 'es',
      storedLanguage: 'el',
      availableLanguages: languages,
      defaultLanguage,
    })

    expect(language).toBe('el')
  })

  it('returns the default language when neither requested nor stored are supported', () => {
    const language = normalizeLanguage({
      requestedLanguage: 'es',
      storedLanguage: 'pt',
      availableLanguages: languages,
      defaultLanguage,
    })

    expect(language).toBe('en')
  })

  it('returns null when there is no requested language', () => {
    const language = normalizeLanguage({
      requestedLanguage: null,
      storedLanguage: 'fr',
      availableLanguages: languages,
      defaultLanguage,
    })

    expect(language).toBeNull()
  })
})
