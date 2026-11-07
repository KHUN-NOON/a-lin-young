'use client'

import * as React from 'react'

interface LayoutContextValue {
  /** Desktop: sidebar shows labels (expanded) or icon rail only. */
  expanded: boolean
  /** Mobile: drawer visibility. */
  mobileOpen: boolean
  /** Toggles the drawer on small screens and expand/collapse on `md:`+. */
  toggleSidebar: () => void
  closeMobile: () => void
}

const LayoutContext = React.createContext<LayoutContextValue | undefined>(
  undefined,
)

const DESKTOP_QUERY = '(min-width: 768px)'

/** UI-only layout state (no persistence, no network – offline safe). */
export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expanded, setExpanded] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const toggleSidebar = React.useCallback(() => {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      setExpanded((v) => !v)
    } else {
      setMobileOpen((v) => !v)
    }
  }, [])

  const closeMobile = React.useCallback(() => setMobileOpen(false), [])

  const value = React.useMemo(
    () => ({ expanded, mobileOpen, toggleSidebar, closeMobile }),
    [expanded, mobileOpen, toggleSidebar, closeMobile],
  )

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

export const useLayout = (): LayoutContextValue => {
  const ctx = React.useContext(LayoutContext)
  if (!ctx) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return ctx
}
