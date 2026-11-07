'use client'

import * as React from 'react'
// No direct Outlet here – children are passed from the root route.
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { LayoutProvider, useLayout } from '@/context/LayoutContext'
import { cn } from '@/utils'

/** Content column – offset by the fixed sidebar width on md+. */
const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { expanded } = useLayout()
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Sidebar />
      <div
        className={cn(
          'flex min-h-screen min-w-0 flex-col transition-[padding] duration-200',
          expanded ? 'md:pl-64' : 'md:pl-16',
        )}
      >
        <Header />
        <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

/**
 * MainLayout – wraps every page: sidebar + header + routed content.
 * UI-only; no data fetching, so offline-first behaviour is unaffected.
 * Children are the root route's `<Outlet />`.
 */
export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <LayoutProvider>
    <Shell>{children}</Shell>
  </LayoutProvider>
)
