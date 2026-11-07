'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  X,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/utils'
import { useLayout } from '@/context/LayoutContext'
import { useLanguage } from '@/context/LanguageContext'
import { BrandLogo } from '@/components/shared/BrandLogo'
import type { TranslationKey } from '@/lib/i18n'

/**
 * Navigation item definition – kept local to this file because the sidebar
 * is the sole consumer.
 */
export type NavChild = {
  labelKey: TranslationKey
  href: string
}

export type NavItem = {
  labelKey: TranslationKey
  href: string
  icon: React.ReactNode
  /** Optional nested links; renders the item as a disclosure group. */
  children?: NavChild[]
}

const navItems: NavItem[] = [
  {
    labelKey: 'sidebar.dashboard',
    href: '/',
    icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
  },
  {
    labelKey: 'sidebar.products',
    href: '/products',
    icon: <BookOpen className="h-5 w-5 shrink-0" />,
    children: [
      { labelKey: 'sidebar.products.all', href: '/products' },
      { labelKey: 'sidebar.products.categories', href: '/products/categories' },
    ],
  },
  {
    labelKey: 'sidebar.customers',
    href: '/customers',
    icon: <Users className="h-5 w-5 shrink-0" />,
  },
  {
    labelKey: 'sidebar.settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5 shrink-0" />,
  },
]

const linkBase =
  'text-muted-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm leading-relaxed font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'

/**
 * Disclosure group (WAI-ARIA): a button toggles a nested list of links.
 * In the md+ icon rail the first click expands the sidebar so the
 * submenu has room, instead of rendering an inline list in 64px.
 */
const NavGroup: React.FC<{ item: NavItem }> = ({ item }) => {
  const { expanded, toggleSidebar, closeMobile } = useLayout()
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const id = React.useId()
  const label = t(item.labelKey)
  const childActive = item.children!.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + '/'),
  )
  const [open, setOpen] = React.useState(childActive)
  const showChildren = open && (expanded || !isDesktop())

  // Hover/focus flyout shown only in the md+ icon rail. Portalled to <body>
  // because the aside's transform would otherwise trap `fixed` positioning.
  const btnRef = React.useRef<HTMLButtonElement>(null)
  const timer = React.useRef<number | undefined>(undefined)
  const [flyout, setFlyout] = React.useState<{ top: number; left: number }>()
  const openFlyout = () => {
    window.clearTimeout(timer.current)
    if (!isDesktop() || expanded || !btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setFlyout({ top: r.top, left: r.right + 4 })
  }
  const closeFlyout = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setFlyout(undefined), 150)
  }
  React.useEffect(() => () => window.clearTimeout(timer.current), [])
  const visibleFlyout = expanded ? undefined : flyout

  const onToggle = () => {
    setFlyout(undefined)
    if (isDesktop() && !expanded) {
      toggleSidebar()
      setOpen(true)
      return
    }
    setOpen((v) => !v)
  }

  return (
    <div
      onMouseEnter={openFlyout}
      onMouseLeave={closeFlyout}
      onFocus={openFlyout}
      onBlur={closeFlyout}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          window.clearTimeout(timer.current)
          setFlyout(undefined)
        }
      }}
    >
      <button
        ref={btnRef}
        type="button"
        aria-expanded={showChildren}
        aria-controls={id}
        title={!expanded ? label : undefined}
        onClick={onToggle}
        className={cn(
          linkBase,
          'w-full',
          childActive && 'text-foreground',
          !expanded && 'md:justify-center md:px-0',
        )}
      >
        {item.icon}
        <span className={cn('flex-1 text-left', !expanded && 'md:sr-only')}>
          {label}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'h-4 w-4 shrink-0 transition-transform',
            showChildren && 'rotate-180',
            !expanded && 'md:hidden',
          )}
        />
      </button>
      <ul
        id={id}
        hidden={!showChildren}
        className="mt-1 ml-5 flex flex-col gap-1 border-l pl-3"
      >
        {item.children!.map((child) => (
          <li key={child.labelKey}>
            <Link
              to={child.href}
              onClick={closeMobile}
              className={cn(linkBase, 'py-2')}
              activeOptions={{ exact: true }}
              activeProps={{
                className: 'bg-accent text-accent-foreground',
                'aria-current': 'page',
              }}
            >
              {t(child.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
      {visibleFlyout &&
        createPortal(
          <div
            role="group"
            aria-label={label}
            style={{ top: visibleFlyout.top, left: visibleFlyout.left }}
            onMouseEnter={openFlyout}
            onMouseLeave={closeFlyout}
            className="bg-card text-card-foreground fixed z-50 min-w-44 rounded-lg border p-1 shadow-md max-md:hidden"
          >
            <p className="text-muted-foreground px-3 py-2 text-xs leading-relaxed font-semibold">
              {label}
            </p>
            <ul className="flex flex-col gap-1">
              {item.children!.map((child) => (
                <li key={child.labelKey}>
                  <Link
                    to={child.href}
                    onClick={() => setFlyout(undefined)}
                    className={cn(linkBase, 'py-2')}
                    activeOptions={{ exact: true }}
                    activeProps={{
                      className: 'bg-accent text-accent-foreground',
                      'aria-current': 'page',
                    }}
                  >
                    {t(child.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  )
}

const isDesktop = () =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches

/**
 * Sidebar – mobile-first.
 *  • < md: off-canvas drawer (labels shown) with backdrop and Escape to close.
 *  • md+: slim icon rail that expands to show labels via the header toggle.
 *
 * Pure UI – no network or Dexie access, so offline behaviour is unaffected.
 */
export const Sidebar: React.FC = () => {
  const { expanded, mobileOpen, closeMobile } = useLayout()
  const { t } = useLanguage()

  React.useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [mobileOpen, closeMobile])

  // Labels are always visible in the mobile drawer; on md+ only when expanded.
  const labelClass = cn(!expanded && 'md:sr-only')

  return (
    <>
      {mobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={cn(
          'bg-card fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r',
          'transition-[transform,width] duration-200 ease-out',
          'md:translate-x-0',
          expanded ? 'md:w-64' : 'md:w-16',
          mobileOpen ? 'translate-x-0' : '-translate-x-full max-md:invisible',
        )}
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center gap-3 border-b px-3',
            !expanded && 'md:justify-center',
          )}
        >
          <BrandLogo />
          <span
            className={cn('flex-1 text-lg font-semibold', labelClass)}
          >
            ALY
          </span>
          <button
            type="button"
            onClick={closeMobile}
            className="text-muted-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:outline-none md:hidden"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">{t('sidebar.close')}</span>
          </button>
        </div>

        <nav
          aria-label={t('sidebar.nav')}
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
        >
          {navItems.map((item) => {
            if (item.children?.length) {
              return <NavGroup key={item.labelKey} item={item} />
            }
            const label = t(item.labelKey)
            return (
              <Link
                key={item.labelKey}
                to={item.href}
                title={!expanded ? label : undefined}
                onClick={closeMobile}
                className={cn(
                  'text-muted-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm leading-relaxed font-medium transition-colors',
                  'hover:bg-muted hover:text-foreground',
                  'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                  !expanded && 'md:justify-center md:px-0',
                )}
                activeProps={{
                  className: 'bg-accent text-accent-foreground',
                }}
              >
                {item.icon}
                <span className={labelClass}>{label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
