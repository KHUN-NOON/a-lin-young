'use client'

import * as React from 'react'
import { Ellipsis, Menu, Moon, Sun } from 'lucide-react'
import { cn } from '@/utils'
import { useTheme } from '@/context/ThemeContext'
import { useLayout } from '@/context/LayoutContext'
import { useLanguage } from '@/context/LanguageContext'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { UserMenu } from '@/components/layout/UserMenu'

const iconButton =
  'text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border focus-visible:ring-2 focus-visible:outline-none'

/**
 * Header – mobile-first.
 *  • < md: toggle | centered logo | ⋯ which reveals the actions below.
 *  • md+: toggle | theme, notifications, user menu.
 * UI only – no network access, safe offline.
 */
export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { toggleSidebar, mobileOpen } = useLayout()
  const { t } = useLanguage()
  const [actionsOpen, setActionsOpen] = React.useState(false)

  return (
    <header className="bg-card sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b px-3 py-3 md:flex-nowrap md:gap-4 md:px-6 md:py-0 md:h-16">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-controls="app-sidebar"
        aria-expanded={mobileOpen}
        className={iconButton}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">{t('header.toggleSidebar')}</span>
      </button>

      <div className="flex flex-1 items-center justify-center gap-2 md:hidden">
        <BrandLogo className="h-9 w-9" />
        <span className="text-xl font-semibold">TailAdmin</span>
      </div>

      <button
        type="button"
        onClick={() => setActionsOpen((v) => !v)}
        aria-expanded={actionsOpen}
        aria-controls="header-actions"
        className={cn(iconButton, 'border-transparent md:hidden')}
      >
        <Ellipsis className="h-5 w-5" />
        <span className="sr-only">{t('header.toggleActions')}</span>
      </button>

      {/* Below md this is a full-width row revealed by the ⋯ button; on md+
          `contents` lets the actions join the main header row. */}
      <div
        id="header-actions"
        className={cn(
          'order-last w-full flex-wrap items-center gap-3 border-t pt-3',
          actionsOpen ? 'flex' : 'hidden',
          'md:contents',
        )}
      >
        <div className="ml-auto flex items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(iconButton, 'h-11 w-11 rounded-full')}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">
              {theme === 'light'
                ? t('header.switchToDark')
                : t('header.switchToLight')}
            </span>
          </button>

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
