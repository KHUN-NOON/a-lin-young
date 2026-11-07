'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

/**
 * Theme definition – the app only supports a simple light / dark toggle.
 * The provider stores the preference in `localStorage` and mirrors the
 * selection on the `<html>` element so Tailwind's `dark:` variants work.
 */
type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

/**
 * ThemeProvider – wrap the entire application (e.g. in `src/main.tsx`).
 * It follows the AGENTS.md rule of using **React Context** as the primary
 * global UI‑state mechanism.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getPreferredTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light'
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') return stored
    } catch {
      // Storage unavailable (private mode) – fall back to system preference.
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  const [theme, setTheme] = useState<Theme>(getPreferredTheme)

  // Keep the HTML root class in sync for Tailwind dark mode.
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Ignore persistence failures; the in-memory theme still applies.
    }
  }, [theme])

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/** Hook for easy consumption inside any component. */
export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
