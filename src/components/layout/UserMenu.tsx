'use client'

import * as React from 'react'
import {
  ChevronDown,
  CircleUserRound,
  Globe,
  Info,
  LogOut,
  Settings,
} from 'lucide-react'
import { cn } from '@/utils'
import { useLanguage } from '@/context/LanguageContext'
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '@/lib/i18n'

/**
 * Placeholder user – there is no auth feature yet. Replace with real auth
 * state (React Context) when it lands.
 */
const user = {
  name: 'Shop Admin',
  email: 'admin@example.com',
  initials: 'SA',
}

type MenuEntry = {
  label: string
  icon: React.ReactNode
  trailing?: React.ReactNode
  onSelect?: () => void
}

/**
 * Accessible header dropdown (hand-built, no new dependencies):
 * `aria-expanded`, Escape / outside-click to close, arrow-key navigation.
 * Items are inert placeholders until their features exist.
 */
export const UserMenu: React.FC = () => {
  const { language, setLanguage, t } = useLanguage()
  const entries: MenuEntry[] = [
    {
      label: t('userMenu.editProfile'),
      icon: <CircleUserRound className="h-5 w-5" />,
    },
    {
      label: t('userMenu.accountSettings'),
      icon: <Settings className="h-5 w-5" />,
    },
    { label: t('userMenu.support'), icon: <Info className="h-5 w-5" /> },
    {
      label: t('userMenu.language'),
      icon: <Globe className="h-5 w-5" />,
      trailing: (
        <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
          {LANGUAGE_LABELS[language]}
        </span>
      ),
      // Cycle to the next supported language.
      onSelect: () => {
        const next =
          SUPPORTED_LANGUAGES[
            (SUPPORTED_LANGUAGES.indexOf(language) + 1) %
              SUPPORTED_LANGUAGES.length
          ]
        setLanguage(next)
      },
    },
  ]
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const menuId = React.useId()

  const close = React.useCallback((returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }, [])

  React.useEffect(() => {
    if (!open) return
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    )
    const index = items.indexOf(document.activeElement as HTMLElement)
    const next =
      e.key === 'ArrowDown'
        ? (index + 1) % items.length
        : (index - 1 + items.length) % items.length
    items[next]?.focus()
  }

  const itemClass =
    'text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium focus-visible:outline-none'

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="focus-visible:ring-ring flex items-center gap-2 rounded-full focus-visible:ring-2 focus-visible:outline-none"
      >
        <span
          aria-hidden="true"
          className="bg-accent text-accent-foreground flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold"
        >
          {user.initials}
        </span>
        <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'text-muted-foreground h-4 w-4 transition-transform',
            open && 'rotate-180',
          )}
        />
        <span className="sr-only">{t('userMenu.trigger')}</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={t('userMenu.label')}
          onKeyDown={onMenuKeyDown}
          className="bg-card absolute right-0 z-50 mt-3 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl border p-3 shadow-lg"
        >
          <div className="px-3 pb-2">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-muted-foreground text-xs">{user.email}</p>
          </div>
          <div className="flex flex-col gap-0.5 border-t pt-2">
            {entries.map((entry) => (
              <button
                key={entry.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  entry.onSelect?.()
                  close(true)
                }}
                className={itemClass}
              >
                {entry.icon}
                <span className="flex-1">{entry.label}</span>
                {entry.trailing}
              </button>
            ))}
          </div>
          <div className="mt-2 border-t pt-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => close(true)}
              className={itemClass}
            >
              <LogOut className="h-5 w-5" />
              {t('userMenu.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
