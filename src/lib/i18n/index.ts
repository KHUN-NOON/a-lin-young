import { en } from './en'
import type { TranslationKey } from './en'
import { my } from './my'

export type { TranslationKey }

export const SUPPORTED_LANGUAGES = ['en', 'my'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: Language = 'en'
export const LANGUAGE_STORAGE_KEY = 'language'

/** Native names, shown in the language switcher regardless of active language. */
export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  my: 'မြန်မာ',
}

/** All dictionaries are bundled so translations work fully offline. */
export const dictionaries: Record<Language, Record<TranslationKey, string>> = {
  en,
  my,
}

export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' &&
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
