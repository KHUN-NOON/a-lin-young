'use client'
// This file renders a client‑only component (MainLayout) that uses hooks.
// Therefore it must be marked as a client component itself.

import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'

import '../styles.css'
import { MainLayout } from '#/components/layout/MainLayout'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 0 } },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <MainLayout>
            <Outlet />
          </MainLayout>
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[
              {
                name: 'TanStack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}
