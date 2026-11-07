import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { LanguageProvider, useLanguage } from './LanguageContext'
import { LANGUAGE_STORAGE_KEY, dictionaries } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

function LanguageConsumer() {
  const { language, setLanguage, t } = useLanguage()
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="dashboard-title">{t('dashboard.title')}</span>
      <span data-testid="stats">
        {t('demo.domStats', { total: 100, cards: 10, nodes: 50 })}
      </span>
      <button type="button" onClick={() => setLanguage('my')}>
        Switch to Burmese
      </button>
      <button type="button" onClick={() => setLanguage('en')}>
        Switch to English
      </button>
    </div>
  )
}

describe('LanguageContext and i18n', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = 'en'
  })

  it('renders English by default when rendered without provider', () => {
    const { result } = renderHook(() => useLanguage())
    expect(result.current.language).toBe('en')
    expect(result.current.t('dashboard.title')).toBe('Dashboard')
  })

  it('provides language switching, updates html lang and persists in localStorage', async () => {
    const user = userEvent.setup()
    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>,
    )

    expect(screen.getByTestId('current-lang')).toHaveTextContent('en')
    expect(screen.getByTestId('dashboard-title')).toHaveTextContent('Dashboard')
    expect(document.documentElement.lang).toBe('en')

    await user.click(screen.getByRole('button', { name: 'Switch to Burmese' }))

    expect(screen.getByTestId('current-lang')).toHaveTextContent('my')
    expect(screen.getByTestId('dashboard-title')).toHaveTextContent(
      'ဒက်ရှ်ဘုတ်',
    )
    expect(document.documentElement.lang).toBe('my')
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('my')

    await user.click(screen.getByRole('button', { name: 'Switch to English' }))

    expect(screen.getByTestId('current-lang')).toHaveTextContent('en')
    expect(screen.getByTestId('dashboard-title')).toHaveTextContent('Dashboard')
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en')
  })

  it('interpolates template parameters in t()', () => {
    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>,
    )
    expect(screen.getByTestId('stats')).toHaveTextContent(
      'Loaded 100 items · rendered 10 cards · 50 DOM nodes in the list',
    )
  })

  it('verifies that Burmese dictionary has 100% parity with English keys', () => {
    const enKeys = Object.keys(dictionaries.en) as TranslationKey[]
    const myKeys = Object.keys(dictionaries.my) as TranslationKey[]

    expect(myKeys.sort()).toEqual(enKeys.sort())

    for (const key of enKeys) {
      expect(dictionaries.my[key]).toBeDefined()
      expect(dictionaries.my[key].length).toBeGreaterThan(0)
    }
  })
})
