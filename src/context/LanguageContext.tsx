'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  dictionaries,
  isLanguage,
} from '@/lib/i18n'
import type { Language, TranslationKey } from '@/lib/i18n'

export type TranslationParams = Record<string, string | number>

export interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey, params?: TranslationParams) => string
}

const formatTranslation = (
  text: string,
  params?: TranslationParams,
): string => {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, key: string) => {
    return key in params ? String(params[key]) : match
  })
}

// Default value lets components render (e.g. in tests) without a provider.
const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key, params) =>
    formatTranslation(dictionaries[DEFAULT_LANGUAGE][key], params),
})

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (isLanguage(stored)) return stored
  } catch {
    // Storage unavailable – fall through to browser language.
  }
  return navigator.language.toLowerCase().startsWith('my')
    ? 'my'
    : DEFAULT_LANGUAGE
}

/**
 * LanguageProvider – React Context i18n (no network, bundled dictionaries).
 * Persists the choice in `localStorage` and mirrors it on `<html lang>`.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch {
      // Ignore persistence failures; in-memory language still applies.
    }
  }, [language])

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, params) =>
        formatTranslation(dictionaries[language][key], params),
    }),
    [language],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

/** Hook for translations and language switching. */
export const useLanguage = (): LanguageContextValue =>
  useContext(LanguageContext)
